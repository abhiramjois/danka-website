<script lang="ts">
	import type { Person } from '$lib/content';

	type PageContent = { title: string; description: string };

	let { data }: { data: { people: Person[]; page: PageContent | null } } = $props();

	const { people, page } = $derived(data);
</script>

<svelte:head>
	<title>{page?.title ?? 'People'} — Danka Studios</title>
	<meta name="description" content={page?.description ?? ''} />
</svelte:head>

<section class="container section page-head">
	<p class="eyebrow accent">People</p>
	<h1 class="display display-xl page-title">{page?.title ?? 'People'}</h1>
	{#if page?.description}
		<p class="muted page-desc">{page.description}</p>
	{/if}
</section>

<section class="container section people-grid-wrap">
	{#if people.length}
		<div class="people-grid">
			{#each people as person (person.slug)}
				<a class="person-card" href={`/people/${person.slug}`}>
					<div class="person-photo">
						{#if person.photo}
							<img src={person.photo} alt={person.name} loading="lazy" />
						{:else}
							<div class="person-photo-empty"></div>
						{/if}
					</div>
					<div class="person-body">
						<h2 class="person-name">{person.name}</h2>
						{#if person.roles?.length}
							<p class="person-roles muted">{person.roles.join(' · ')}</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<p class="muted center empty-state">No people yet. Add your team in the CMS at <a class="accent" href="/admin">/admin</a>.</p>
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

	.people-grid-wrap {
		padding-top: 0;
	}

	.people-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.person-card {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--card);
		overflow: hidden;
		transition: transform 0.2s ease, border-color 0.2s ease;
	}

	.person-card:hover {
		transform: translateY(-4px);
		border-color: var(--accent);
	}

	.person-photo img {
		aspect-ratio: 1 / 1;
		width: 100%;
		object-fit: cover;
		filter: grayscale(30%);
		transition: filter 0.2s ease;
	}

	.person-card:hover .person-photo img {
		filter: grayscale(0%);
	}

	.person-photo-empty {
		aspect-ratio: 1 / 1;
		background: linear-gradient(135deg, #f0ece8, #e5ded8);
	}

	.person-body {
		padding: 1.15rem 1.2rem 1.3rem;
	}

	.person-name {
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 400;
		color: var(--accent);
	}

	.person-roles {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		text-transform: capitalize;
	}

	.empty-state {
		padding: 3rem 1rem;
	}

	@media (max-width: 900px) {
		.people-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 560px) {
		.people-grid {
			grid-template-columns: 1fr;
		}
	}
</style>