import matter from 'gray-matter';

/**
 * Every markdown file under content/ is pulled in at build time as a raw
 * string. This replaces the old node:fs reads, which cannot run on
 * Cloudflare Workers. With every route prerendered there is no runtime
 * content layer at all — the markdown is bundled by Vite during the build.
 */
const rawFiles = import.meta.glob('/content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

type ParsedFile = {
	data: Record<string, unknown>;
	content: string;
	slug: string;
};

const parsedFiles = new Map<string, ParsedFile>();
for (const [file, raw] of Object.entries(rawFiles)) {
	const { data, content } = matter(raw);
	parsedFiles.set(file, {
		data: data as Record<string, unknown>,
		content,
		slug: file.split('/').pop()?.replace(/\.md$/, '') ?? ''
	});
}

export type Credit = { role: string; name: string };

export type FolioItem = {
	slug: string;
	title: string;
	url: string;
	description: string;
	cover: string;
	posters: string[];
	screengrabs: string[];
	tags: string[];
	director: string;
	writer: string;
	cast_crew: Credit[];
};

export type Person = {
	slug: string;
	name: string;
	photo: string;
	bio: string;
	roles: string[];
};

export type Collaboration = {
	slug: string;
	title: string;
	subtitle?: string;
	image?: string;
	illustration?: string;
	description: string;
	/** Slug of a linked Folio item */
	folio?: string;
	url?: string;
};

export type WhatWeDoCard = {
	label: string;
	illustration: string;
};

export type HomeContent = {
	hero_title: string;
	tagline: string;
	description: string;
	youtube_title: string;
	youtube_follow_label: string;
	cta_title: string;
	cta_description: string;
	collab_title: string;
	collab_description: string;
	about_title: string;
	about_description: string;
	stats_subscribers: string;
	stats_videos: string;
	stats_views: string;
	what_we_do: WhatWeDoCard[];
	data_updated_note: string;
};

export type PageContent = {
	slug: string;
	title: string;
	description: string;
};

// Callers pass repo-relative paths ('content/pages/home.md'); the glob keys are
// root-relative ('/content/pages/home.md').
function readMarkdownFile(rel: string): ParsedFile | null {
	return parsedFiles.get(`/${rel.replace(/^\.\//, '')}`) ?? null;
}

function listDir(dir: string): string[] {
	const prefix = `/content/${dir}/`;
	return [...parsedFiles.entries()]
		.filter(([file]) => file.startsWith(prefix))
		.map(([, parsed]) => `${parsed.slug}.md`)
		.sort();
}

function str(v: unknown, fallback = ''): string {
	return typeof v === 'string' ? v : fallback;
}

// Image widget values can be stored as absolute URLs (/images/foo.png) or as
// bare paths relative to the media folder (foo.png / img/foo.png) depending on
// how the CMS saved the entry. Normalize both to public URLs under /images/.
function resolveMediaPath(v: string): string {
	const trimmed = v.trim();
	if (!trimmed) return '';
	if (trimmed.startsWith('/')) return trimmed;
	return `/images/${trimmed.replace(/^\.\.?\//, '')}`;
}

function strList(v: unknown): string[] {
	if (Array.isArray(v)) {
		return v.flatMap((x) => {
			if (typeof x === 'string') return x ? [x] : [];
			if (x && typeof x === 'object') {
				const o = x as Record<string, unknown>;
				const pick = o.image ?? o.title ?? o.name ?? o.tag ?? o.role ?? o.value;
				return typeof pick === 'string' && pick ? [pick] : [];
			}
			return [];
		});
	}
	if (v && typeof v === 'object') {
		// list widgets can store {titles:[...]} style structures
		const o = v as Record<string, unknown>;
		if (Array.isArray(o.titles)) return o.titles.filter((x): x is string => typeof x === 'string' && x.length > 0);
		if (Array.isArray(o.items)) return strList(o.items);
	}
	return [];
}

function pairList(v: unknown): Credit[] {
	if (!Array.isArray(v)) return [];
	return v.flatMap((x) => {
		if (x && typeof x === 'object') {
			const o = x as Record<string, unknown>;
			const role = typeof o.role === 'string' ? o.role.trim() : '';
			const name = typeof o.name === 'string' ? o.name.trim() : '';
			return role || name ? [{ role, name }] : [];
		}
		return [];
	});
}

export function readHomeContent(): HomeContent {
	const file = readMarkdownFile('content/pages/home.md');
	const d = file?.data ?? {};
	return {
		hero_title: str(d.hero_title, 'An art collective'),
		tagline: str(d.tagline, 'Short films | Theatre | Music'),
		description: str(
			d.description,
			'Danka Studios is an art collective of passionate storytellers, filmmakers, and artists, dedicated to creating innovative and meaningful content.'
		),
		youtube_title: str(d.youtube_title, 'We have begun our journey with the Youtube channel Danka studios.'),
		youtube_follow_label: str(d.youtube_follow_label, 'Watch on Youtube'),
		cta_title: str(d.cta_title, 'Have a story to tell?'),
		cta_description: str(d.cta_description, 'If you an individual, brand, organization, collective, studio looking to tell a story. Work with us to bring your story to life.'),
		collab_title: str(d.collab_title, 'What we do'),
		collab_description: str(d.collab_description, 'Stories told across short films, theatre, music and brands.'),
		about_title: str(d.about_title, 'About our team'),
		about_description: str(
			d.about_description,
			'We a multi disciplinary group of individual with our own unique practices in art, theatre, film, design and content creation.'
		),
		stats_subscribers: str(d.stats_subscribers, '4,530'),
		stats_videos: str(d.stats_videos, '72'),
		stats_views: str(d.stats_views, '700K'),
		what_we_do: Array.isArray(d.what_we_do)
			? (d.what_we_do as Record<string, unknown>[])
					.map((card) => ({
						label: str(card?.label),
						illustration: str(card?.illustration)
					}))
					.filter((card) => card.label || card.illustration)
			: [],
		data_updated_note: str(d.data_updated_note, '')
	};
}

export function readPageContent(slug: string): PageContent | null {
	const file = readMarkdownFile(`content/pages/${slug}.md`);
	if (!file) return null;
	return {
		slug,
		title: str(file.data.title, slug),
		description: str(file.data.description, '')
	};
}

export function readFolioItems(): FolioItem[] {
	return listDir('folio')
		.map((f) => readFolioItem(f.replace(/\.md$/, '')))
		.filter((x): x is FolioItem => !!x)
		// Newest first by the frontmatter date. This used to sort on file mtime,
		// which cannot work here (no filesystem) and was not reproducible anyway —
		// simply touching a file reshuffled the whole page.
		.sort((a, b) => {
			const da = str(readMarkdownFile(`content/folio/${a.slug}.md`)?.data.date, '');
			const db = str(readMarkdownFile(`content/folio/${b.slug}.md`)?.data.date, '');
			if (da === db) return a.slug.localeCompare(b.slug);
			return da < db ? 1 : -1;
		});
}

export function readFolioItem(slug: string): FolioItem | null {
	const file = readMarkdownFile(`content/folio/${slug}.md`);
	if (!file) return null;
	const posters = strList(file.data.posters).map(resolveMediaPath);
	const screengrabs = strList(file.data.screengrabs).map(resolveMediaPath);
	return {
		slug,
		title: str(file.data.title, slug),
		url: str(file.data.url, ''),
		description: file.content,
		cover: resolveMediaPath(str(file.data.cover, posters[0] || screengrabs[0] || '')),
		posters,
		screengrabs,
		tags: strList(file.data.tags),
		director: str(file.data.director, ''),
		writer: str(file.data.writer, ''),
		cast_crew: pairList(file.data.cast_crew)
	};
}

export function readPeople(): Person[] {
	return listDir('people').map((f) => readPerson(f.replace(/\.md$/, ''))).filter((x): x is Person => !!x);
}

export function readPerson(slug: string): Person | null {
	const file = readMarkdownFile(`content/people/${slug}.md`);
	if (!file) return null;
	return {
		slug,
		name: str(file.data.name, slug),
		photo: resolveMediaPath(str(file.data.photo, '')),
		bio: file.content,
		roles: strList(file.data.roles)
	};
}

export function readCollaborations(): Collaboration[] {
	return listDir('collaborations').map((f) => readCollaboration(f.replace(/\.md$/, ''))).filter((x): x is Collaboration => !!x);
}

export function readCollaboration(slug: string): Collaboration | null {
	const file = readMarkdownFile(`content/collaborations/${slug}.md`);
	if (!file) return null;
	return {
		slug,
		title: str(file.data.title, slug),
		subtitle: str(file.data.subtitle),
		image: resolveMediaPath(str(file.data.image)),
		illustration: resolveMediaPath(str(file.data.illustration || '')),
		description: file.content,
		folio: str(file.data.folio),
		url: str(file.data.url)
	};
}

export function resolveFolioLink(item: { slug: string; title: string }, folioItems: FolioItem[]): string | null {
	// Find a linked folio item by slug (or by matching title) so the link stays valid even after renames.
	const bySlug = folioItems.find((f) => f.slug === item.slug);
	const byTitle = folioItems.find((f) => f.title === item.slug);
	const target = bySlug ?? byTitle;
	return target ? `/folio/${target.slug}` : null;
}