import { readFolioItems, readPageContent } from '$lib/content';

export const load = async () => {
	const items = readFolioItems();
	const page = readPageContent('folio');
	return { items, page };
};