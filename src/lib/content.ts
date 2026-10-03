import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

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
	description: string;
	/** Slug of a linked Folio item */
	folio?: string;
	url?: string;
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
	data_updated_note: string;
};

export type PageContent = {
	slug: string;
	title: string;
	description: string;
};

function readMarkdownFile(rel: string) {
	const full = path.join(process.cwd(), rel);
	if (!fs.existsSync(full)) return null;
	const { data, content } = matter(fs.readFileSync(full, 'utf-8'));
	return { data, content, slug: path.basename(rel, '.md') };
}

function listDir(dir: string): string[] {
	const full = path.join(CONTENT_ROOT, dir);
	if (!fs.existsSync(full)) return [];
	return fs
		.readdirSync(full)
		.filter((f) => f.endsWith('.md'))
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
		.sort((a, b) => {
			try {
				const pa = path.join(CONTENT_ROOT, 'folio', `${a.slug}.md`);
				const pb = path.join(CONTENT_ROOT, 'folio', `${b.slug}.md`);
				const sa = fs.statSync(pa).mtimeMs;
				const sb = fs.statSync(pb).mtimeMs;
				return sb - sa;
			} catch {
				return 0;
			}
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