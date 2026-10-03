<script lang="ts">
	import type { YtData } from '$lib/server/youtube';

	let {
		youtube,
		channelUrl,
		title,
		fallbackStats
	}: {
		youtube: YtData;
		channelUrl: string;
		title: string;
		fallbackStats?: { subscribers: string; videos: string; views: string };
	} = $props();

	const stats = $derived(
		youtube.source === 'fallback' && fallbackStats
			? [
					{ value: fallbackStats.subscribers, label: 'Subscribers' },
					{ value: fallbackStats.videos, label: 'Videos' },
					{ value: fallbackStats.views, label: 'Views' }
				]
			: [
					{ value: youtube.channel.subscriberCount, label: 'Subscribers' },
					{ value: youtube.channel.videoCount, label: 'Videos' },
					{ value: youtube.channel.viewCount, label: 'Views' }
				]
	);

	const fallbackThumbs = ['/images/thumb-1.jpg', '/images/thumb-2.jpg', '/images/thumb-3.jpg', '/images/thumb-4.jpg'];
	const cards = $derived(
		youtube.videos.length
			? youtube.videos.slice(0, 10)
			: Array.from({ length: 10 }, (_, i) => ({
					videoId: '',
					title: '',
					publishedAt: '',
					thumbnail: fallbackThumbs[i % fallbackThumbs.length]
				}))
	);

	function hideOnError(e: Event) {
		(e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
	}
</script>

<section class="container section youtube-section">
	<div class="journey">
		<p class="display display-md journey-title">{title}</p>
		<div class="journey-actions">
			<a class="btn btn-solid" href={channelUrl} target="_blank" rel="noopener noreferrer">Youtube</a>
			<a class="btn btn-outline" href="/folio">Folio</a>
		</div>
	</div>

	<div class="stats">
		{#each stats as s (s.label)}
			<div class="stat">
				<p class="stat-value">{s.value}</p>
				<p class="stat-label muted">{s.label}</p>
			</div>
		{/each}
	</div>

	<div class="marquee">
		<div class="marquee-track">
			{#each cards as card, i (card.videoId || i)}
				<img class="marquee-img" src={card.thumbnail} alt="" draggable="false" decoding="async" onerror={hideOnError} />
			{/each}
			{#each cards as card, i (card.videoId || `b-${i}`)}
				<img class="marquee-img" src={card.thumbnail} alt="" draggable="false" decoding="async" onerror={hideOnError} />
			{/each}
		</div>
	</div>
</section>

<style>
	.marquee {
		overflow: hidden;
		margin-top: clamp(2.5rem, 5vw, 3.5rem);
		margin-inline: calc(50% - 50vw);
		mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
		-webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
	}

	.marquee-track {
		display: flex;
		width: max-content;
		animation: marquee 45s linear infinite;
	}

	.marquee-img {
		width: calc((100vw - 2.5rem) / 3);
		aspect-ratio: 16 / 9;
		object-fit: cover;
		background: var(--ink);
		flex-shrink: 0;
		margin-right: 1.25rem;
	}

	@keyframes marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	.stats {
		display: flex;
		justify-content: center;
		gap: clamp(2.5rem, 8vw, 6.5rem);
		margin-top: clamp(2.5rem, 5vw, 3.5rem);
		flex-wrap: wrap;
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		font-family: var(--display);
		font-size: clamp(2.4rem, 6vw, 3.9rem);
		color: var(--paper);
		line-height: 1;
	}

	.stat-label {
		margin-top: 0.7rem;
		font-size: 0.95rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.journey {
		text-align: center;
	}

	.journey-actions {
		margin-top: 2.2rem;
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
			flex-wrap: wrap;
		}
	}
</style>