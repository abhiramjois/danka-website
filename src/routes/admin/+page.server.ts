import { redirect } from '@sveltejs/kit';

// In dev, the Vite static middleware only serves exact files (not directory indexes),
// so /admin and /admin/ would 404. Route them to the self-hosted Sveltia CMS SPA,
// which assembly/production already serves at /admin/index.html.
export const load = () => {
	redirect(302, '/admin/index.html');
};