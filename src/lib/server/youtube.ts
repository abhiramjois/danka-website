import { env } from '$env/dynamic/private';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

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
	uploadsPlaylistId: string;
};

export type YtData = {
	source: 'youtube' | 'fallback';
	updatedAt: string;
	channel: YtChannel;
	videos: YtVideo[];
};

const DEFAULT_CHANNEL_URL = 'https://www.youtube.com/@DankaStudios';

const TTL_MS =
	env.YOUTUBE_CACHE_TTL_MS && Number(env.YOUTUBE_CACHE_TTL_MS) > 0 ? Number(env.YOUTUBE_CACHE_TTL_MS) : 60 * 1000;

type CacheEntry = { at: number; data: YtData };
let cache: CacheEntry | null = null;
let inflight: Promise<YtData> | null = null;

function ytdlpPath(): string {
	return env.YTDLP_PATH || 'yt-dlp';
}

function channelUrl(): string {
	return env.YOUTUBE_CHANNEL_URL || DEFAULT_CHANNEL_URL;
}

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

function fallbackData(reason?: string): YtData {
	console.warn('[yt-dlp] using fallback data', reason ?? '');
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
			viewCount: compact(FALLBACK_STATS.viewCount),
			uploadsPlaylistId: ''
		},
		videos: []
	};
}

type YtdlpEntry = {
	id?: string;
	title?: string;
	view_count?: number;
	thumbnails?: { url?: string; width?: number; height?: number }[];
	timestamp?: number;
};

type YtdlpPlaylistJson = {
	id?: string;
	channel_id?: string;
	channel?: string;
	title?: string;
	description?: string;
	channel_follower_count?: number;
	thumbnails?: { url?: string; width?: number; height?: number }[];
	entries?: YtdlpEntry[];
};

async function runYtdlpJson(tab: 'videos' | 'shorts'): Promise<YtdlpPlaylistJson> {
	const url = `${channelUrl().replace(/\/$/, '')}/${tab}`;
	const { stdout } = await execFileAsync(ytdlpPath(), ['-J', '--flat-playlist', '--no-warnings', url], {
		timeout: 60_000,
		maxBuffer: 16 * 1024 * 1024
	});
	return JSON.parse(stdout) as YtdlpPlaylistJson;
}

function pickThumb(e: YtdlpEntry | undefined | null, fallback = ''): string {
	const thumbs = e?.thumbnails ?? [];
	if (!thumbs.length) return fallback;
	const sorted = thumbs
		.filter((t) => t.url)
		.sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
	return sorted[0]?.url ?? '';
}

async function fetchFromYtDlp(): Promise<YtData> {
	const [videosJson, shortsJson] = await Promise.allSettled([runYtdlpJson('videos'), runYtdlpJson('shorts')]);

	const main = videosJson.status === 'fulfilled' ? videosJson.value : null;
	if (!main?.entries?.length) {
		throw new Error(
			videosJson.status === 'rejected'
				? String(videosJson.reason)
				: 'yt-dlp returned no video entries for the channel'
		);
	}

	const shortsEntries = shortsJson.status === 'fulfilled' ? shortsJson.value.entries ?? [] : [];

	const videoEntries = main.entries.filter((e) => e.id);
	const shortsCount = shortsEntries.filter((e) => e.id).length;

	const totalViews =
		videoEntries.reduce((s, e) => s + (e.view_count ?? 0), 0) +
		shortsEntries.reduce((s, e) => s + (e.view_count ?? 0), 0);

	const videos: YtVideo[] = videoEntries.slice(0, 10).map((e) => ({
		videoId: e.id ?? '',
		title: e.title ?? 'Untitled',
		publishedAt: e.timestamp ? new Date(e.timestamp * 1000).toISOString() : '',
		thumbnail: pickThumb(e),
		views: e.view_count != null ? compact(e.view_count) : undefined
	}));

	const avatar = pickThumb({ thumbnails: main.thumbnails });

	return {
		source: 'youtube',
		updatedAt: new Date().toISOString(),
		channel: {
			channelId: main.channel_id ?? main.id ?? '',
			title: main.channel ?? main.title?.replace(/ - Videos$/, '') ?? 'Danka Studios',
			description: main.description ?? '',
			thumbnail: avatar,
			subscriberCount: compact(main.channel_follower_count ?? FALLBACK_STATS.subscriberCount),
			videoCount: String(videoEntries.length + shortsCount),
			viewCount: compact(totalViews),
			uploadsPlaylistId: ''
		},
		videos
	};
}

export async function getYouTubeData(): Promise<YtData> {
	if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
	if (inflight) return inflight;

	inflight = (async () => {
		try {
			const data = await fetchFromYtDlp();
			if (data.channel.subscriberCount) {
				cache = { at: Date.now(), data };
			}
			return data;
		} catch (err) {
			return fallbackData(String(err));
		} finally {
			inflight = null;
		}
	})();

	return inflight;
}