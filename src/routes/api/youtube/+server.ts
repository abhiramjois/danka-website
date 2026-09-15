import { json } from '@sveltejs/kit';
import { getYouTubeData } from '$lib/server/youtube';

export const GET = async () => {
	const data = await getYouTubeData();
	return json(data, {
		headers: {
			'cache-control': 'no-cache',
			'access-control-allow-origin': '*'
		}
	});
};