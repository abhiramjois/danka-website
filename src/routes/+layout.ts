/**
 * Every route is prerendered at build time. Content is bundled by Vite (see
 * src/lib/content.ts), so there is nothing left to do per-request — which is
 * what lets this run on Cloudflare Workers, where node:fs does not exist.
 */
export const prerender = true;