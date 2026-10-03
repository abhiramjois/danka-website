import { json } from '@sveltejs/kit';
import { getYouTubeData } from '$lib/server/youtube';

export const GET = () => {
	const data = getYouTubeData();
	return json(data, {
		headers: {
			'cache-control': 'public, max-age=3600, s-maxage=86400',
			'access-control-allow-origin': '*'
		}
	});
};
