<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import type { Collaboration, FolioItem } from '$lib/content';

	let {
		data
	}: {
		data: {
			collab: Collaboration;
			folioLink: string | null;
			folioItem: FolioItem | null;
			next: Collaboration | null;
		};
	} = $props();

	const { collab, folioLink, folioItem, next } = $derived(data);

	const relatedHref = $derived(folioLink ?? folioItem?.url ?? '');
	const relatedExternal = $derived(!folioLink && Boolean(folioItem?.url));
</script>

<svelte:head>
	<title>{collab.title} — Collaborate with Danka Studios</title>
	<meta name="description" content={collab.description?.replace(/[#>*_`[\]-]/g, ' ').slice(0, 160)} />
</svelte:head>

<section class="container section collab-detail">
	{#if collab.image}
		<div class="collab-media">
			<img src={collab.image} alt={collab.title} loading="lazy" />
		</div>
	{/if}

	<div class="collab-main">
		<div class="collab-title">
			<p class="eyebrow accent">Collaborate</p>
			<h1 class="display display-xl collab-name">{collab.title}</h1>
			{#if collab.subtitle}
				<p class="collab-sub muted">{collab.subtitle}</p>
			{/if}
		</div>

		<div class="collab-desc">
			<Markdown content={collab.description} />
		</div>

		<div class="collab-actions">
			{#if relatedHref}
				<a class="btn btn-outline" href={relatedHref} target={relatedExternal ? '_blank' : undefined} rel={relatedExternal ? 'noopener noreferrer' : undefined}>
					Related work: {folioItem?.title ?? 'View project'}
				</a>
			{:else}
				<p class="muted-soft collab-pending">No folio project linked yet — add one in the CMS at <a class="accent" href="/admin">/admin</a>.</p>
			{/if}
		</div>

		<a class="back-link" href="/collaborate">← Back to collaborate</a>
	</div>
</section>

{#if next}
	<a class="next-card" href={`/collaborate/${next.slug}`}>
		<div class="container next-inner">
			<span class="eyebrow">Next type</span>
			<span class="display display-md next-name">{next.title}</span>
		</div>
	</a>
{/if}

<style>
	.collab-detail {
		display: grid;
		grid-template-columns: 440px 1fr;
		gap: clamp(2rem, 5vw, 4rem);
		align-items: start;
		padding-top: clamp(3rem, 7vw, 5rem);
	}

	.collab-media img {
		aspect-ratio: 4 / 3;
		width: 100%;
		object-fit: cover;
		border-radius: var(--radius);
		border: 1px solid var(--line);
	}

	.collab-main {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.collab-name {
		margin-top: 0.9rem;
	}

	.collab-sub {
		margin-top: 0.5rem;
		font-size: 1rem;
	}

	.collab-desc {
		margin-top: 2rem;
		max-width: 640px;
	}

	.collab-actions {
		margin-top: 2.2rem;
	}

	.collab-pending {
		font-size: 0.9rem;
	}

	.back-link {
		display: inline-block;
		margin-top: 2.5rem;
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

	@media (max-width: 860px) {
		.collab-detail {
			grid-template-columns: 1fr;
		}

		.collab-media {
			max-width: 480px;
		}
	}
</style>