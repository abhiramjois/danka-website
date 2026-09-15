<script lang="ts">
	import YoutubeSection from '$lib/components/YoutubeSection.svelte';
	import type { HomeContent, FolioItem, Person, Collaboration } from '$lib/content';
	import type { YtData } from '$lib/server/youtube';

	let {
		data
	}: {
		data: {
			home: HomeContent;
			folio: FolioItem[];
			people: Person[];
			collaborations: Collaboration[];
			youtube: YtData;
			roles: string[];
			channelUrl: string;
		};
	} = $props();

	const { home, youtube, collaborations, roles, channelUrl } = $derived(data);

	// Collaboration cards — each entry shows a title plus an optional sub-type,
	// mirroring the "Short films / Web series" paired grid of the landing page.
	const collabCards = $derived(collaborations);
</script>

<svelte:head>
	<title>Danka Studios — An art collective</title>
</svelte:head>

<!-- Hero -->
<section class="container hero center">
	<p class="eyebrow accent">Danka Studios</p>
	<h1 class="display display-xl hero-title">{home.hero_title}</h1>
	<p class="display display-md hero-tagline">{home.tagline}</p>
	<p class="hero-description muted">{home.description}</p>
</section>

<!-- YouTube: thumbnails + numbers (live) -->
<section class="youtube-zone">
	<YoutubeSection
		{youtube}
		{channelUrl}
		title={home.youtube_title}
		fallbackStats={{ subscribers: home.stats_subscribers, videos: home.stats_videos, views: home.stats_views }}
	/>
</section>

<!-- CTA -->
<section class="container section cta center">
	<p class="eyebrow">Get in touch</p>
	<h2 class="display display-lg cta-title">{home.cta_title}</h2>
	<p class="cta-description muted">{home.cta_description}</p>
	<a class="btn btn-solid cta-btn" href="/collaborate">Collaborate with us</a>
</section>

<!-- What we do / collaboration types -->
<section class="container section collab">
	<div class="collab-head">
		<div>
			<p class="eyebrow accent">What we do</p>
			<h2 class="display display-lg collab-title">{home.collab_title}</h2>
		</div>
		<a class="btn btn-outline" href="/collaborate">View all</a>
	</div>
	<p class="muted collab-desc">{home.collab_description}</p>

	<div class="collab-grid">
		{#each collabCards as item (item.slug)}
			<a class="collab-card" href={`/collaborate/${item.slug}`}>
				<div class="collab-media">
					{#if item.image}
						<img src={item.image} alt={item.title} loading="lazy" />
					{:else}
						<div class="collab-media-empty"></div>
					{/if}
				</div>
				<div class="collab-labels">
					<span class="collab-label primary">{item.title}</span>
					{#if item.subtitle}
						<span class="collab-label">{item.subtitle}</span>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</section>

<!-- Team -->
<section class="container section team">
	<div class="team-media">
		<img src="/images/team.jpg" alt="Danka Studios team" loading="lazy" />
	</div>
	<div class="team-copy">
		<p class="eyebrow accent">Our people</p>
		<h2 class="display display-lg team-title">{home.about_title}</h2>
		<p class="muted team-desc">{home.about_description}</p>
		<div class="roles">
			{#each roles as role (role)}
				<span class="role-chip">{role}</span>
			{/each}
		</div>
		<a class="btn btn-outline team-link" href="/people">Meet the team</a>
	</div>
</section>

<style>
	/* Hero */
	.hero {
		padding-block: clamp(5rem, 12vw, 9rem) clamp(4rem, 9vw, 7rem);
	}

	.hero-title {
		margin-top: 1.4rem;
	}

	.hero-tagline {
		margin-top: 1.1rem;
		color: var(--accent);
	}

	.hero-description {
		margin-top: 2rem;
		max-width: 46em;
		margin-inline: auto;
		font-size: 1.02rem;
	}

	.youtube-zone {
		border-top: 1px solid var(--line);
	}

	.youtube-zone :global(.youtube-section) {
		border-top: 0;
	}

	/* CTA */
	.cta-title {
		margin-top: 1.1rem;
	}

	.cta-description {
		margin-top: 1.4rem;
		max-width: 44em;
		margin-inline: auto;
	}

	.cta-btn {
		margin-top: 2.4rem;
	}

	/* Collab */
	.collab-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.collab-title {
		margin-top: 0.8rem;
	}

	.collab-desc {
		margin-top: 1.2rem;
		max-width: 40em;
	}

	.collab-grid {
		margin-top: 3rem;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.collab-card {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--card);
		transition: transform 0.2s ease, border-color 0.2s ease;
	}

	.collab-card:hover {
		transform: translateY(-4px);
		border-color: var(--accent);
	}

	.collab-media img {
		aspect-ratio: 16 / 10;
		width: 100%;
		object-fit: cover;
	}

	.collab-media-empty {
		aspect-ratio: 16 / 10;
		width: 100%;
		background: linear-gradient(135deg, #101010, #1a1516);
	}

	.collab-labels {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 1.1rem 1.2rem 1.25rem;
	}

	.collab-label {
		font-size: 0.9rem;
		color: var(--muted);
		text-transform: capitalize;
	}

	.collab-label.primary {
		font-family: var(--display);
		font-size: 1.3rem;
		color: var(--accent);
	}

	/* Team */
	.team {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(2rem, 5vw, 4.5rem);
		align-items: center;
	}

	.team-media img {
		border-radius: var(--radius);
		border: 1px solid var(--line);
		aspect-ratio: 4 / 3;
		object-fit: cover;
		width: 100%;
	}

	.team-title {
		margin-top: 0.8rem;
	}

	.team-desc {
		margin-top: 1.4rem;
		max-width: 38em;
	}

	.roles {
		margin-top: 2rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.role-chip {
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		color: var(--accent);
		border: 1px solid var(--accent-deep);
		border-radius: 999px;
		padding: 0.4rem 1rem;
		background: var(--accent-wash);
		text-transform: lowercase;
	}

	.team-link {
		margin-top: 2.2rem;
	}

	@media (max-width: 900px) {
		.collab-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.team {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 520px) {
		.collab-grid {
			grid-template-columns: 1fr;
		}
	}
</style>