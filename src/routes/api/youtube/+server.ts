import { json } from '@sveltejs/kit';
import { getYouTubeData } from '$lib/server/youtube';

// The data is bundled at build time, so this endpoint can be emitted as a
// static JSON file instead of needing a server runtime.
export const prerender = true;

export const GET = () => {
	const data = getYouTubeData();
	return json(data, {
		headers: {
			'cache-control': 'public, max-age=3600, s-maxage=86400',
			'access-control-allow-origin': '*'
		}
	});
};
