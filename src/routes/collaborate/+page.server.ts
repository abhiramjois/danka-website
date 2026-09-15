import { readCollaborations, readFolioItems, readPageContent, resolveFolioLink } from '$lib/content';

export const load = async () => {
	const collaborations = readCollaborations();
	const folioItems = readFolioItems();
	const page = readPageContent('collaborate');

	const items = collaborations.map((c) => ({
		slug: c.slug,
		title: c.title,
		subtitle: c.subtitle,
		image: c.image,
		description: c.description,
		folioLink: c.folio ? resolveFolioLink({ slug: c.folio, title: c.folio }, folioItems) : null
	}));

	return { items, page };
};