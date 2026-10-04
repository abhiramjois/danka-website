import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Every route is prerendered (see src/routes/+layout.ts) and all content
		// is bundled at build time, so there is no server component at runtime.
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['*']
			}
		})
	}
};

export default config;