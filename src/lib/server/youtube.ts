import youtubeJson from '$lib/data/youtube.json';

export type YtVideo = {
	videoId: string;
	title: string;
	publishedAt: string;
	thumbnail: string;
	views?: string;
};

export type YtChannel = {
	channelId: string;
	title: string;
	description: string;
	thumbnail: string;
	subscriberCount: string;
	videoCount: string;
	viewCount: string;
};

export type YtData = {
	source: 'youtube' | 'fallback';
	updatedAt: string;
	channel: YtChannel;
	videos: YtVideo[];
};

function compact(n: number): string {
	if (!Number.isFinite(n)) return '0';
	if (n < 1000) return n.toLocaleString('en-IN');
	if (n < 1_000_000) {
		const k = n / 1000;
		const rounded = k >= 100 ? Math.round(k) : Math.round(k * 10) / 10;
		return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}K`;
	}
	const m = n / 1_000_000;
	const rounded = m >= 10 ? Math.round(m) : Math.round(m * 10) / 10;
	return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
}

const FALLBACK_STATS = { subscriberCount: 4530, videoCount: 72, viewCount: 793514 };

function fallbackData(): YtData {
	return {
		source: 'fallback',
		updatedAt: new Date().toISOString(),
		channel: {
			channelId: 'UC57RodGlZednaNDRKs13uMQ',
			title: 'Danka Studios',
			description: '',
			thumbnail: '/images/channel-fallback.svg',
			subscriberCount: compact(FALLBACK_STATS.subscriberCount),
			videoCount: String(FALLBACK_STATS.videoCount),
			viewCount: compact(FALLBACK_STATS.viewCount)
		},
		videos: []
	};
}

/**
 * Return pre-fetched YouTube data bundled at build time.
 * Run `npm run fetch:youtube` to refresh. No API calls or yt-dlp at runtime.
 */
export function getYouTubeData(): YtData {
	if (youtubeJson?.channel?.subscriberCount) {
		return { source: 'youtube', ...youtubeJson };
	}
	return fallbackData();
}
