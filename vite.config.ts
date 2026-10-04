import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				// Every route is prerendered and all content is bundled at build
				// time, so nothing needs a server runtime at request time.
				routes: {
					include: ['/*'],
					exclude: ['*']
				}
			}),
			prerender: {
				handleHttpError: ({ path, message, status }) => {
					// /admin is the TinaCMS single-page app, emitted as a static
					// asset (static/admin/index.html) rather than a SvelteKit
					// route, so there is nothing to prerender. Pages that link to
					// it ("add content in the CMS") make the crawler try anyway.
					if (path === '/admin' || path.startsWith('/admin/')) return;
					throw new Error(`${status} ${path}: ${message}`);
				}
			}
		})
	]
});