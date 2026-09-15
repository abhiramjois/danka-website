import { readHomeContent, readFolioItems, readPeople, readCollaborations } from '$lib/content';
import { getYouTubeData } from '$lib/server/youtube';

export const load = async () => {
	const home = readHomeContent();
	const folio = readFolioItems();
	const people = readPeople();
	const collaborations = readCollaborations();
	const youtube = await getYouTubeData();

	const defaultRoles = ['Filmmakers', 'Directors', 'Storytellers', 'Writers', 'Creators', 'Musicians', 'Theatre practitioners', 'Artists'];
	const roles = people.length ? Array.from(new Set(people.flatMap((p) => p.roles))).filter(Boolean) : defaultRoles;

	return {
		home,
		folio,
		people,
		collaborations,
		youtube,
		roles,
		channelUrl: `https://www.youtube.com/channel/${youtube.channel.channelId}`
	};
};