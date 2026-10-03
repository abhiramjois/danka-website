import { redirect } from '@sveltejs/kit';

// In dev, the Vite static middleware only serves exact files (not directory indexes),
// so /admin and /admin/ would 404. Route them to the self-hosted Tina CMS SPA,
// which is generated into static/admin by `tinacms dev` / `tinacms build`.
export const load = () => {
	redirect(302, '/admin/index.html');
};