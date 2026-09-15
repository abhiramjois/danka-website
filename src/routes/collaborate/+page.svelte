<script lang="ts">
	type PageContent = { title: string; description: string };

	type CollabItem = {
		slug: string;
		title: string;
		subtitle?: string;
		image?: string;
		description: string;
		folioLink: string | null;
	};

	let { data }: { data: { items: CollabItem[]; page: PageContent | null } } = $props();

	const { items, page } = $derived(data);
</script>

<svelte:head>
	<title>{page?.title ?? 'Collaborate'} — Danka Studios</title>
	<meta name="description" content={page?.description ?? ''} />
</svelte:head>

<section class="container section page-head">
	<p class="eyebrow accent">Collaborate</p>
	<h1 class="display display-xl page-title">{page?.title ?? 'Collaborate'}</h1>
	{#if page?.description}
		<p class="muted page-desc">{page.description}</p>
	{/if}
</section>

<section class="container section collab-grid-wrap">
	{#if items.length}
		<div class="collab-grid">
			{#each items as item (item.slug)}
				<a class="collab-item" href={`/collaborate/${item.slug}`}>
					{#if item.image}
						<div class="collab-media">
							<img src={item.image} alt={item.title} loading="lazy" />
						</div>
					{:else}
						<div class="collab-media collab-media-empty"></div>
					{/if}
					<div class="collab-body">
						<h2 class="collab-name">{item.title}</h2>
						{#if item.subtitle}
							<p class="collab-sub muted">{item.subtitle}</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<p class="muted center empty-state">No collaboration types yet. Add them in the CMS at <a class="accent" href="/admin">/admin</a>.</p>
	{/if}
</section>

<style>
	.page-head {
		text-align: center;
		padding-top: clamp(3rem, 7vw, 5.5rem);
	}

	.page-title {
		margin-top: 1rem;
	}

	.page-desc {
		margin-top: 1.3rem;
		max-width: 40em;
		margin-inline: auto;
	}

	.collab-grid-wrap {
		padding-top: 0;
	}

	.collab-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.collab-item {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--card);
		overflow: hidden;
		transition: transform 0.2s ease, border-color 0.2s ease;
	}

	.collab-item:hover {
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
		background: linear-gradient(135deg, #101010, #1a1516);
	}

	.collab-body {
		padding: 1.15rem 1.2rem 1.3rem;
	}

	.collab-name {
		font-family: var(--display);
		font-size: 1.5rem;
		font-weight: 400;
		color: var(--accent);
	}

	.collab-sub {
		margin-top: 0.3rem;
		font-size: 0.9rem;
	}

	.empty-state {
		padding: 3rem 1rem;
	}

	@media (max-width: 900px) {
		.collab-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 560px) {
		.collab-grid {
			grid-template-columns: 1fr;
		}
	}
</style>