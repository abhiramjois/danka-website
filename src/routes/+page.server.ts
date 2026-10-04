import { readHomeContent, readFolioItems, readPeople } from '$lib/content';
import { getYouTubeData } from '$lib/server/youtube';

export type DankaMark = {
	side: 'left' | 'right';
	/** Base rotation in degrees. The spin animation adds a full turn on top. */
	r: number;
};

/**
 * Fixed, deterministic pair. All positioning lives in CSS (media queries drive
 * the corners) — nothing inline, otherwise inline styles would override the
 * responsive rules. Mark 1 sits top-left, mark 2 bottom-right.
 */
function makeDankaMarks(): DankaMark[] {
	return [
		{ side: 'left', r: 7 },
		{ side: 'right', r: -7 }
	];
}

export const load = async () => {
	const home = readHomeContent();
	const folio = readFolioItems();
	const people = readPeople();
	const youtube = getYouTubeData();

	const defaultRoles = ['Filmmakers', 'Directors', 'Storytellers', 'Writers', 'Creators', 'Musicians', 'Theatre practitioners', 'Artists'];
	const roles = people.length ? Array.from(new Set(people.flatMap((p) => p.roles))).filter(Boolean) : defaultRoles;

	return {
		home,
		folio,
		people,
		youtube,
		roles,
		channelUrl: `https://www.youtube.com/channel/${youtube.channel.channelId}`,
		dankaMarks: makeDankaMarks()
	};
};