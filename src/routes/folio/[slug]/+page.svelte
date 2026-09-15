<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import type { FolioItem } from '$lib/content';

	let { data }: { data: { item: FolioItem; next: FolioItem | null } } = $props();

	const { item, next } = $derived(data);
</script>

<svelte:head>
	<title>{item.title} — Danka Studios</title>
	<meta name="description" content={item.description?.replace(/[#>*_`[\]-]/g, ' ').slice(0, 160)} />
</svelte:head>

<section class="container section detail-head">
	<div class="detail-title">
		<p class="eyebrow accent">Folio</p>
		<h1 class="display display-xl detail-name">{item.title}</h1>
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

{#if item.gallery?.length}
	<section class="container gallery">
		<div class="gallery-grid">
			{#each item.gallery as img, i (img + i)}
				<figure>
					<img src={img} alt={`${item.title} — ${i + 1}`} loading="lazy" />
				</figure>
			{/each}
		</div>
	</section>
{/if}

<section class="container section detail-body">
	<div class="rich-wrap">
		<Markdown content={item.description} />
	</div>
	<a class="back-link" href="/folio">← Back to folio</a>
</section>

{#if next}
	<a class="next-card" href={`/folio/${next.slug}`}>
		<div class="container next-inner">
			<span class="eyebrow">Next project</span>
			<span class="display display-md next-name">{next.title}</span>
		</div>
	</a>
{/if}

<style>
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

	.tags {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
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

	.gallery {
		padding-block: 0 2rem;
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

	.detail-body {
		padding-top: 3rem;
	}

	.rich-wrap {
		max-width: 720px;
	}

	.back-link {
		display: inline-block;
		margin-top: 3rem;
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
		color: #e08b82;
	}

	.next-name {
		transition: color 0.15s ease;
	}

	@media (max-width: 720px) {
		.detail-meta {
			align-items: flex-start;
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}
	}
</style>