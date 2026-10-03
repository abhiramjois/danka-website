<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import type { FolioItem } from '$lib/content';

	let { data }: { data: { item: FolioItem; next: FolioItem | null } } = $props();

	const { item, next } = $derived(data);

	const heroImage = $derived(item.cover || item.posters[0] || item.screengrabs[0] || '');

	function hideOnError(e: Event) {
		(e.currentTarget as HTMLElement).style.display = 'none';
	}
</script>

<svelte:head>
	<title>{item.title} — Danka Studios</title>
	<meta name="description" content={item.description?.replace(/[#>*_`[\]-]/g, ' ').slice(0, 160)} />
</svelte:head>

{#if heroImage}
	<section class="hero">
		<div class="container hero-grid">
			<div class="hero-media">
				<img src={heroImage} alt={`${item.title} — poster`} loading="eager" onerror={hideOnError} />
			</div>

			<div class="hero-copy">
				<p class="eyebrow accent">Folio</p>
				<h1 class="display hero-title">{item.title}</h1>

				{#if item.tags?.length}
					<div class="tags">
						{#each item.tags as tag (tag)}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}

				{#if item.url}
					<div class="hero-actions">
						<a class="btn btn-solid" href={item.url} target="_blank" rel="noopener noreferrer">
							Open project ↗
						</a>
					</div>
				{/if}

				{#if item.description}
					<div class="rich-wrap">
						<Markdown content={item.description} />
					</div>
				{/if}
			</div>
		</div>

		{#if item.director || item.writer || item.cast_crew?.length}
			<div class="container credits">
				<h2 class="eyebrow accent credits-title">Credits</h2>
				<div class="credits-grid">
					{#if item.director}
						<div class="credit">
							<span class="credit-role">Director</span>
							<span class="credit-name">{item.director}</span>
						</div>
					{/if}
					{#if item.writer}
						<div class="credit">
							<span class="credit-role">Writer</span>
							<span class="credit-name">{item.writer}</span>
						</div>
					{/if}
					{#each item.cast_crew as credit, i (i)}
						<div class="credit">
							<span class="credit-role">{credit.role}</span>
							<span class="credit-name">{credit.name}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</section>
{:else}
	<section class="container section detail-head">
		<div class="detail-title">
			<p class="eyebrow accent">Folio</p>
			<h1 class="display detail-name">{item.title}</h1>
		</div>

		<div class="detail-meta">
			{#if item.url}
				<a class="btn btn-solid" href={item.url} target="_blank" rel="noopener noreferrer">
					Open project ↗
				</a>
			{/if}
			{#if item.tags?.length}
				<div class="tags">
					{#each item.tags as tag (tag)}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}

{#if item.screengrabs?.length}
	<section class="container section gallery-block">
		<p class="eyebrow accent">Screengrabs</p>
		<div class="gallery-grid">
			{#each item.screengrabs as img, i (img + i)}
				<figure>
					<img src={img} alt={`${item.title} — screengrab ${i + 1}`} loading="lazy" />
				</figure>
			{/each}
		</div>
	</section>
{/if}

<section class="container back-zone">
	<a class="back-link" href="/folio">← Back to folio</a>
</section>

{#if next}
	<a class="next-card" href={`/folio/${next.slug}`}>
		<div class="container next-inner">
			<span class="eyebrow">Next project</span>
			<span class="display next-name">{next.title}</span>
		</div>
	</a>
{/if}

<style>
	/* Two-halves hero — media left, copy right */
	.hero {
		border-bottom: 1px solid var(--line);
		padding-block: clamp(2.5rem, 6vw, 4.5rem) clamp(0.5rem, 2vw, 1.5rem);
	}

	.hero-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: clamp(2rem, 4.5vw, 4rem);
		align-items: center;
	}

	.hero-media img {
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		object-fit: contain;
		background: #faf8f5;
		border-radius: var(--radius);
		border: 1px solid var(--line);
		box-shadow: 0 24px 60px -24px rgba(60, 40, 35, 0.35);
	}

	.hero-copy {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.hero-title {
		margin-top: 0.35rem;
		text-wrap: balance;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.tag {
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0.3rem 0.75rem;
	}

	.hero-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.rich-wrap {
		max-width: 640px;
	}

	/* Credits */
	.credits {
		margin-top: clamp(2rem, 4vw, 3.5rem);
		padding-top: clamp(1.5rem, 3vw, 2rem);
		border-top: 1px solid var(--line);
	}

	.credits-title {
		margin-bottom: 1.1rem;
	}

	.credits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1.4rem 2rem;
	}

	.credit {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.credit-role {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.22em;
		color: var(--muted-soft);
	}

	.credit-name {
		font-size: 1rem;
		color: var(--ink);
		font-weight: 400;
	}

	/* Fallback head (no media) */
	.detail-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 2rem;
		flex-wrap: wrap;
		padding-top: clamp(3rem, 7vw, 5rem);
	}

	.detail-name {
		margin-top: 0.9rem;
	}

	.detail-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1rem;
	}

	/* Gallery */
	.gallery-block {
		padding-block: clamp(2.5rem, 6vw, 4rem) 2rem;
	}

	.gallery-block .eyebrow {
		margin-bottom: 1.2rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.gallery-grid figure {
		margin: 0;
	}

	.gallery-grid img {
		aspect-ratio: 4 / 3;
		width: 100%;
		object-fit: cover;
		border-radius: var(--radius);
		border: 1px solid var(--line);
	}

	.back-zone {
		padding-block: 1rem 2rem;
	}

	.back-link {
		display: inline-block;
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.24em;
		color: var(--muted);
		transition: color 0.15s ease;
	}

	.back-link:hover {
		color: var(--accent);
	}

	.next-card {
		display: block;
		border-top: 1px solid var(--line);
	}

	.next-inner {
		padding-block: 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.next-card:hover .next-name {
		color: var(--accent-deep);
	}

	.next-name {
		transition: color 0.15s ease;
	}

	@media (max-width: 860px) {
		.hero-grid {
			grid-template-columns: 1fr;
		}

		.hero-copy {
			gap: 1rem;
		}

		.detail-meta {
			align-items: flex-start;
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		img {
			transition: none;
		}
	}
</style>