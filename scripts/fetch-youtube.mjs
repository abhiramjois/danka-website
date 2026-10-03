#!/usr/bin/env node
/**
 * Fetch YouTube channel data and download thumbnails locally.
 *
 * Run manually:  node scripts/fetch-youtube.mjs
 * Run in CI:     npm run fetch:youtube
 *
 * Requires yt-dlp on PATH (or set YTDLP_PATH env).
 * Outputs:
 *   src/lib/data/youtube.json       — channel stats + video list (bundled at build time)
 *   static/images/thumbnails/       — video thumbnails (hqdefault) + channel avatar
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DATA_FILE = path.join(ROOT, 'src', 'lib', 'data', 'youtube.json');
const THUMB_DIR = path.join(ROOT, 'static', 'images', 'thumbnails');

const CHANNEL_URL = process.env.YOUTUBE_CHANNEL_URL || 'https://www.youtube.com/@DankaStudios';
const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';
const THUMB_COUNT = 10;

function compact(n) {
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

async function runYtdlp(args) {
  const { stdout } = await execFileAsync(YTDLP, args, {
    timeout: 30_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

function vidThumbUrl(id) {
  // Use higher quality thumbnail
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

function getExistingThumbIds() {
  if (!existsSync(THUMB_DIR)) return new Set();
  return new Set(
    readdirSync(THUMB_DIR)
      .filter((f) => f.endsWith('.jpg'))
      .map((f) => f.replace('.jpg', ''))
  );
}

async function main() {
  console.log(`Fetching channel: ${CHANNEL_URL}`);

  mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  mkdirSync(THUMB_DIR, { recursive: true });

  // Fetch channel + videos in one flat-playlist call
  let channelData;
  try {
    channelData = await runYtdlp(['-J', '--flat-playlist', '--no-warnings', CHANNEL_URL + '/videos']);
  } catch (err) {
    console.error('Failed to fetch channel data:', err.message);
    process.exit(1);
  }

  // Fetch shorts separately
  let shortsData = null;
  try {
    shortsData = await runYtdlp(['-J', '--flat-playlist', '--no-warnings', CHANNEL_URL + '/shorts']);
  } catch {
    console.warn('Could not fetch shorts (non-fatal)');
  }

  const videoEntries = (channelData.entries || []).filter((e) => e.id);
  const shortsEntries = (shortsData?.entries || []).filter((e) => e.id);

  const totalViews =
    videoEntries.reduce((s, e) => s + (e.view_count ?? 0), 0) +
    shortsEntries.reduce((s, e) => s + (e.view_count ?? 0), 0);

  // Pick best channel avatar
  const thumbs = channelData.thumbnails || [];
  const sorted = thumbs.filter((t) => t.url).sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const avatarUrl = sorted[0]?.url || '';

  // Download channel avatar locally
  let avatarLocal = '/images/channel-fallback.svg';
  if (avatarUrl) {
    const avatarDest = path.join(THUMB_DIR, 'channel.jpg');
    try {
      await downloadFile(avatarUrl, avatarDest);
      avatarLocal = '/images/thumbnails/channel.jpg';
      console.log('  [ok]   channel avatar');
    } catch (err) {
      console.warn(`  [fail] channel avatar: ${err.message}`);
    }
  }

  const videos = videoEntries.slice(0, THUMB_COUNT).map((e) => ({
    videoId: e.id,
    title: e.title || 'Untitled',
    publishedAt: e.timestamp ? new Date(e.timestamp * 1000).toISOString() : '',
    views: e.view_count != null ? compact(e.view_count) : undefined,
  }));

  // Build the data JSON (thumbnail paths are local)
  const data = {
    updatedAt: new Date().toISOString(),
    channel: {
      channelId: channelData.channel_id || channelData.id || '',
      title: channelData.channel || channelData.title?.replace(/ - Videos$/, '') || 'Danka Studios',
      description: channelData.description || '',
      thumbnail: avatarLocal,
      subscriberCount: compact(channelData.channel_follower_count ?? 0),
      videoCount: String(videoEntries.length + shortsEntries.length),
      viewCount: compact(totalViews),
    },
    videos: videos.map((v) => ({
      ...v,
      thumbnail: `/images/thumbnails/${v.videoId}.jpg`,
    })),
  };

  // Download thumbnails
  console.log(`Downloading ${videos.length} thumbnails...`);
  const existing = getExistingThumbIds();

  let downloaded = 0;
  for (const v of videos) {
    const dest = path.join(THUMB_DIR, `${v.videoId}.jpg`);
    if (existing.has(v.videoId)) {
      console.log(`  [skip] ${v.videoId} (exists)`);
      continue;
    }
    try {
      await downloadFile(vidThumbUrl(v.videoId), dest);
      downloaded++;
      console.log(`  [ok]   ${v.videoId}`);
    } catch (err) {
      console.warn(`  [fail] ${v.videoId}: ${err.message}`);
    }
  }

  // Save data JSON
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
  console.log(`\nSaved ${DATA_FILE}`);
  console.log(`Channel: ${data.channel.title}`);
  console.log(`Subscribers: ${data.channel.subscriberCount}`);
  console.log(`Videos: ${data.channel.videoCount}`);
  console.log(`Views: ${data.channel.viewCount}`);
  console.log(`Thumbnails: ${downloaded} downloaded, ${videos.length - downloaded} skipped/existing`);
  console.log(`Updated: ${data.updatedAt}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
