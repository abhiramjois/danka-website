import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Vite loads .env itself, but this script reads process.env before Vite runs,
// so without this a local `npm run build` would always skip the CMS build and
// silently reuse whatever was in static/admin. Real environment variables
// (CI/Netlify) must keep winning over the file.
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
	const status = run(['tinacms', 'build'])
	if (status !== 0) process.exit(status)
} else {
	// A missing Tina token should not block a deploy of the site itself —
	// only the /admin editor will be unavailable. Because static/admin is
	// gitignored, whatever is already in that folder gets deployed as-is.
	console.warn(
		'\n[tina] NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN are not set — skipping the CMS build.\n' +
			'[tina] /admin will be missing or stale until these are configured (see .env.example).\n'
	)
}

process.exit(run(['vite', 'build']))