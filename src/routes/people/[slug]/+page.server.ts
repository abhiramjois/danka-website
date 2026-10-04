import { error } from '@sveltejs/kit';
import { readPerson, readPeople } from '$lib/content';

export const load = async ({ params }) => {
	const person = readPerson(params.slug);
	if (!person) throw error(404, 'Person not found');

	const all = readPeople();
	const index = all.findIndex((p) => p.slug === person.slug);
	const next = index >= 0 ? all[(index + 1) % all.length] : null;

	return { person, next };
};

/**
 * Prerendering needs the full list of paths up front, since there is no
 * server to resolve a slug at request time.
 */
export const entries = () =>
	readPeople()
		.map((person) => ({ slug: person.slug }))
		.sort((a, b) => a.slug.localeCompare(b.slug));
