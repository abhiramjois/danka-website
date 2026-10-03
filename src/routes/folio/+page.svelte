<script lang="ts">
	import type { FolioItem } from '$lib/content';

	type PageContent = { title: string; description: string };

	let { data }: { data: { items: FolioItem[]; page: PageContent | null } } = $props();

	const { items, page } = $derived(data);
</script>

<svelte:head>
	<title>{page?.title ?? 'Folio'} — Danka Studios</title>
	<meta name="description" content={page?.description ?? ''} />
</svelte:head>

<section class="container section page-head">
	<p class="eyebrow accent">Folio</p>
	<h1 class="display display-xl page-title">{page?.title ?? 'Folio'}</h1>
	{#if page?.description}
		<p class="muted page-desc">{page.description}</p>
	{/if}
</section>

<section class="container section folio-grid-wrap">
	{#if items.length}
		{#each [['Web Series', 'web series'], ['Short Films', 'short film'], ['Music', 'music'], ['Docu-drama', 'docu-drama']] as [label, key] (label)}
			{@const catItems = items.filter(item => item.tags?.some(t => t.toLowerCase().includes(key)))}
			{#if catItems.length}
				<div class="category-section">
					<h2 class="display display-md category-title">{label}</h2>
					<div class="folio-grid">
						{#each catItems as item (item.slug)}
							<a class="folio-card" href={`/folio/${item.slug}`}>
								{#if item.cover}
									<div class="folio-media">
										<img src={item.cover} alt={item.title} loading="lazy" />
									</div>
								{:else}
									<div class="folio-media folio-media-empty"></div>
								{/if}
								<div class="folio-body">
									<h2 class="folio-name">{item.title}</h2>
									{#if item.tags?.length}
										<div class="folio-tags">
											{#each item.tags as tag (tag)}
												<span class="tag">{tag}</span>
											{/each}
										</div>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
		{@const otherItems = items.filter(item => !item.tags?.some(t => ['web series','short film','spoken poetry','music video','song','docu-drama'].some(k => t.toLowerCase().includes(k))))}
		{#if otherItems.length}
			<div class="category-section">
				<h2 class="display display-md category-title">Other</h2>
				<div class="folio-grid">
					{#each otherItems as item (item.slug)}
						<a class="folio-card" href={`/folio/${item.slug}`}>
							{#if item.cover}
								<div class="folio-media">
									<img src={item.cover} alt={item.title} loading="lazy" />
								</div>
							{:else}
								<div class="folio-media folio-media-empty"></div>
							{/if}
							<div class="folio-body">
								<h2 class="folio-name">{item.title}</h2>
								{#if item.tags?.length}
									<div class="folio-tags">
										{#each item.tags as tag (tag)}
											<span class="tag">{tag}</span>
										{/each}
									</div>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<p class="muted center empty-state">No folio items yet. Add your first project in the CMS at <a class="accent" href="/admin">/admin</a>.</p>
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

	.folio-grid-wrap {
		padding-top: 0;
	}

	.category-section {
		margin-bottom: clamp(2rem, 4vw, 3rem);
	}

	.category-title {
		margin-bottom: clamp(1rem, 2vw, 1.5rem);
		color: var(--accent);
	}

	.folio-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.folio-card {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--card);
		overflow: hidden;
		transition: transform 0.2s ease, border-color 0.2s ease;
		display: flex;
		flex-direction: column;
	}

	.folio-card:hover {
		transform: translateY(-4px);
		border-color: var(--accent);
	}

	.folio-media img {
		aspect-ratio: 4 / 3;
		width: 100%;
		height: 100%;
		object-fit: contain;
		background: #faf8f5;
	}

	.folio-media-empty {
		aspect-ratio: 4 / 3;
		background: linear-gradient(135deg, #f0ece8, #e5ded8);
	}

	.folio-body {
		padding: 1.15rem 1.2rem 1.3rem;
	}

	.folio-name {
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 400;
		color: var(--accent);
	}

	.folio-tags {
		margin-top: 0.7rem;
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
		padding: 0.25rem 0.7rem;
	}

	.empty-state {
		padding: 3rem 1rem;
	}

	@media (max-width: 900px) {
		.folio-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 560px) {
		.folio-grid {
			grid-template-columns: 1fr;
		}
	}
</style>