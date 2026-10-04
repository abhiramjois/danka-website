import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const OUT = resolve(process.cwd(), '.svelte-kit/cloudflare')

if (!existsSync(OUT)) {
	console.error(
		`[cloudflare] ${OUT} does not exist.\n` +
			'[cloudflare] Run the build command first (npm run build).'
	)
	process.exit(1)
}

if (!process.env.CLOUDFLARE_API_TOKEN) {
	console.error(
		'[cloudflare] CLOUDFLARE_API_TOKEN is not set.\n' +
			'[cloudflare] Without it wrangler cannot authenticate. Either set the variable,\n' +
			'[cloudflare] or clear the deploy command in the Cloudflare dashboard so Pages\n' +
			'[cloudflare] uploads this directory itself.'
	)
	process.exit(1)
}

const result = spawnSync('wrangler', ['pages', 'deploy', '.svelte-kit/cloudflare'], {
	stdio: 'inherit'
})

process.exit(result.status ?? 1)