import { readPageContent } from '$lib/content';

export const load = async () => {
	const page = readPageContent('collaborate');
	return { page };
};