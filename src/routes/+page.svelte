<script lang="ts">
	import YoutubeSection from '$lib/components/YoutubeSection.svelte';
	import type { HomeContent, FolioItem, Person, Collaboration } from '$lib/content';
	import type { YtData } from '$lib/server/youtube';
	import type { DankaMark } from './+page.server';

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
			dankaMarks: DankaMark[];
		};
	} = $props();

	const { home, youtube, collaborations, roles, channelUrl, dankaMarks } = $derived(data);

	function markStyle(m: DankaMark) {
		const dir = m.side === 'right' ? 1 : -1;
		return `top: ${m.offsetTop}%; ${m.side}: 0; --x: ${dir * m.x}%; --r: ${m.r}deg;`;
	}

	const waveLines = Array.from({ length: 18 }, (_, i) => {
		const t = i / 17;
		const y = (0.03 + t * 0.94) * 320;
		const amp = 22 + (i % 5) * 7;
		return `M0,${y} C 240,${y - amp} 480,${y + amp} 720,${y} C 960,${y - amp} 1200,${y + amp} 1440,${y}`;
	});

	// Collaboration illustrations — shown as a simple non-clickable gallery.
	const illustrationFor: Record<string, string> = {
		'ad-campaigns': '/illustrations/brandads-removebg-preview.png',
		music: '/illustrations/musiccomposition-removebg-preview.png',
		'short-films': '/illustrations/shortfilms-webseries-removebg-preview.png',
		theatre: '/illustrations/theatreplays-removebg-preview.png'
	};

	const collabCards = $derived(collaborations);
</script>

<svelte:head>
	<title>Danka Studios — An art collective</title>
</svelte:head>

<!-- Hero -->
<section class="hero-zone">
	<svg class="wave-bg" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
		{#each waveLines as d, i (d)}
			<path
				class="wave-line"
				style={`animation-delay: -${i * 0.4}s`}
				d={d}
				fill="none"
				stroke="#f0bda2"
				stroke-width="0.6"
				vector-effect="non-scaling-stroke"
				stroke-opacity="0.28"
			/>
		{/each}
	</svg>

	{#each dankaMarks as m, i (i)}
		<img
			aria-hidden="true"
			class="danka-mark"
			src="/illustrations/Danka logo.png"
			alt=""
			draggable="false"
			style={markStyle(m)}
		/>
	{/each}

	<div class="container hero center">
		<p class="eyebrow accent">Danka Studios</p>
		<h1 class="display display-xl hero-title">{home.hero_title}</h1>
		<p class="display display-md hero-tagline">{home.tagline}</p>
		<p class="hero-description muted">{home.description}</p>
	</div>
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

<!-- CTA + collaboration types -->
<section class="container section cta center">
	<p class="eyebrow">Get in touch</p>
	<h2 class="display display-lg cta-title">{home.cta_title}</h2>
	<p class="cta-description muted">{home.cta_description}</p>
	<a class="btn btn-solid cta-btn" href="/collaborate">Collaborate with us</a>

	<div class="collab-grid">
		{#each collabCards as item (item.slug)}
			<div class="collab-card">
				<img src={illustrationFor[item.slug] ?? item.image} alt={item.title} loading="lazy" />
				<span class="collab-label">{item.title}</span>
			</div>
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
	.hero-zone {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.wave-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
	}

	.wave-line {
		animation: wave-drift 7s ease-in-out infinite alternate;
		will-change: transform;
	}

	@keyframes wave-drift {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-9px);
		}
	}

	.hero {
		position: relative;
		z-index: 2;
		width: 100%;
		padding-block: clamp(5rem, 12vw, 9rem) clamp(4rem, 9vw, 7rem);
		transform: translateY(-1.75rem);
	}

	.danka-mark {
		position: absolute;
		z-index: 1;
		opacity: 0.55;
		width: clamp(18rem, 42vw, 34rem);
		height: auto;
		user-select: none;
		pointer-events: none;
		transform: translate(var(--x, 0), var(--y, 0)) rotate(var(--r, 0deg));
		animation:
			danka-in 1.1s ease both,
			danka-spin 40s linear infinite;
		will-change: transform, opacity;
	}

	@keyframes danka-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 0.55;
		}
	}

	@keyframes danka-spin {
		from {
			transform: translate(var(--x, 0), var(--y, 0)) rotate(var(--r, 0deg));
		}
		to {
			transform: translate(var(--x, 0), var(--y, 0)) rotate(calc(var(--r, 0deg) + 360deg));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.danka-mark {
			animation: none;
		}

		.wave-line {
			animation: none;
		}
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

	/* Collab illustrations — same section as the CTA above */
	.collab-grid {
		margin-top: clamp(1.75rem, 3.5vw, 2.75rem);
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.collab-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
	}

	.collab-card img {
		width: 100%;
		height: auto;
	}

	.collab-label {
		font-family: var(--display);
		font-size: 1.15rem;
		color: var(--accent);
		text-align: center;
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