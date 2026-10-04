import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

// Vite loads .env itself, but this script reads process.env before Vite runs,
// so without this a local `npm run build` would always skip the CMS build and
// silently reuse whatever was in static/admin. Real environment variables
// (CI, Cloudflare Pages) must keep winning over the file.
const envPath = resolve(process.cwd(), '.env')
if (existsSync(envPath)) {
	for (const [key, value] of Object.entries(parseEnv(envPath))) {
		if (process.env[key] === undefined) process.env[key] = value
	}
}

function parseEnv(path) {
	const out = {}
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/)
		if (!match || line.trimStart().startsWith('#')) continue
		let value = match[2].trim()
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1)
		}
		out[match[1]] = value
	}
	return out
}

const run = (args) => {
	const result = spawnSync('npx', ['--no-install', ...args], { stdio: 'inherit' })
	if (result.error) throw result.error
	return result.status ?? 1
}

const hasCredentials = Boolean(
	process.env.NEXT_PUBLIC_TINA_CLIENT_ID && process.env.TINA_TOKEN
)

if (hasCredentials) {
	// TinaCloud re-indexes from the git push via its own webhook, so a CI
	// build does not need to talk to TinaCloud at all.
	//
	// --skip-indexing     don't push content up from the build
	// --skip-cloud-checks don't block on "Checking indexing process in
	//                     TinaCloud". TinaCloud processes commits itself and a
	//                     busy index queue leaves this waiting until the CI
	//                     build is killed, which is what left deploys stuck and
	//                     the live site serving stale content.
	//
	// Locally we keep both checks so schema drift is caught before it is
	// pushed; in CI they only add a way for the deploy to fail.
	const args = ['tinacms', 'build', '--skip-indexing']
	if (process.env.CI) args.push('--skip-cloud-checks')

	const status = run(args)
	if (status !== 0) {
		console.warn(
			'\n[tina] CMS build failed — continuing so the site still deploys.\n' +
				'[tina] /admin will 404 on this deploy until the next successful build.\n'
		)
	}
} else {
	// A missing Tina token should not block a deploy of the site itself —
	// only the /admin editor will be unavailable. Because static/admin is
	// gitignored, whatever is already in that folder gets deployed as-is.
	console.warn(
		'\n[tina] NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN are not set — skipping the CMS build.\n' +
			'[tina] /admin will be missing or stale until these are configured (see .env.example).\n'
	)
}

const status = run(['vite', 'build'])

if (status === 0) dropUnusedWorker()

process.exit(status)

/**
 * Cloudflare Pages serves static assets natively, so it needs no Worker at all.
 * adapter-cloudflare still emits one, but it is dead code here: with every route
 * prerendered, _routes.json excludes "*" and no request is ever routed to it.
 *
 * Deleting it means `wrangler pages deploy` has nothing to bundle with esbuild,
 * which matters on CI images where npm may skip dependency install scripts.
 */
function dropUnusedWorker() {
	const out = new URL('../.svelte-kit/cloudflare/', import.meta.url)
	const routesPath = new URL('_routes.json', out)

	if (!existsSync(routesPath)) return

	const routes = JSON.parse(readFileSync(routesPath, 'utf8'))
	const unreachable = routes.exclude?.includes('*') && !routes.include?.some((p) => p !== '/*')

	if (!unreachable) return

	for (const file of ['_worker.js', '_routes.json']) {
		const path = new URL(file, out)
		if (existsSync(path)) {
			rmSync(path)
			console.log(`[cloudflare] removed unused ${file} (no routes require the Worker)`)
		}
	}
}