import { error } from '@sveltejs/kit';
import { readFolioItem, readFolioItems } from '$lib/content';

export const load = async ({ params }) => {
	const item = readFolioItem(params.slug);
	if (!item) throw error(404, 'Folio item not found');

	const all = readFolioItems();
	const index = all.findIndex((f) => f.slug === item.slug);
	const next = index >= 0 ? all[(index + 1) % all.length] : null;

	return { item, next };
};