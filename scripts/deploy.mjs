import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const OUT = resolve(process.cwd(), '.svelte-kit/cloudflare')

if (!existsSync(OUT)) {
	console.error(
		`[cloudflare] ${OUT} does not exist.\n` +
			'[cloudflare] Run the build first (npm run build).'
	)
	process.exit(1)
}

if (!process.env.CLOUDFLARE_API_TOKEN) {
	console.error(
		'[cloudflare] CLOUDFLARE_API_TOKEN is not set, so wrangler cannot authenticate.\n' +
			'[cloudflare] Add it under Settings -> Variables and Secrets in the Cloudflare dashboard.'
	)
	process.exit(1)
}

// Everything this project needs is declared in wrangler.toml: the project
// name and the [assets] directory. Passing paths here would override that and
// is how "Pages project does not exist" mistakes happen.
const result = spawnSync('wrangler', ['deploy'], { stdio: 'inherit' })

process.exit(result.status ?? 1)