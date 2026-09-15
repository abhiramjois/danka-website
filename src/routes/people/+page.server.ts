import { readPeople, readPageContent } from '$lib/content';

export const load = async () => {
	const people = readPeople();
	const page = readPageContent('people');
	return { people, page };
};