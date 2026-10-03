import { spawnSync } from 'node:child_process'

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
	// only the /admin editor will be unavailable.
	console.warn(
		'\n[tina] NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN are not set — skipping the CMS build.\n' +
			'[tina] /admin will 404 until these are configured (see .env.example).\n'
	)
}

process.exit(run(['vite', 'build']))