import { error } from '@sveltejs/kit';
import { readCollaboration, readCollaborations, readFolioItem, readFolioItems, resolveFolioLink } from '$lib/content';

export const load = async ({ params }) => {
	const collab = readCollaboration(params.slug);
	if (!collab) throw error(404, 'Collaboration type not found');

	const folioItems = readFolioItems();
	const folioItem = collab.folio ? readFolioItem(collab.folio) : null;

	const all = readCollaborations();
	const index = all.findIndex((c) => c.slug === collab.slug);
	const next = index >= 0 ? all[(index + 1) % all.length] : null;

	return {
		collab,
		folioLink: collab.folio ? resolveFolioLink({ slug: collab.folio, title: collab.folio }, folioItems) : null,
		folioItem,
		next
	};
};

/**
 * Prerendering needs the full list of paths up front, since there is no
 * server to resolve a slug at request time.
 */
export const entries = () =>
	readCollaborations()
		.map((collab) => ({ slug: collab.slug }))
		.sort((a, b) => a.slug.localeCompare(b.slug));