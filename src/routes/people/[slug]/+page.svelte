<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import type { Person } from '$lib/content';

	let { data }: { data: { person: Person; next: Person | null } } = $props();

	const { person, next } = $derived(data);
</script>

<svelte:head>
	<title>{person.name} — Danka Studios</title>
	<meta name="description" content={person.bio?.replace(/[#>*_`[\]-]/g, ' ').slice(0, 160)} />
</svelte:head>

<section class="container section person-detail">
	<div class="person-photo">
		{#if person.photo}
			<img src={person.photo} alt={person.name} loading="lazy" />
		{:else}
			<div class="person-photo-empty"></div>
		{/if}
	</div>

	<div class="person-main">
		<div class="person-title">
			<p class="eyebrow accent">People</p>
			<h1 class="display display-xl person-name">{person.name}</h1>
			{#if person.roles?.length}
				<div class="roles">
					{#each person.roles as role (role)}
						<span class="role-chip">{role}</span>
					{/each}
				</div>
			{/if}
		</div>

		<div class="bio">
			<Markdown content={person.bio} />
		</div>

		<a class="back-link" href="/people">← Back to people</a>
	</div>
</section>

{#if next}
	<a class="next-card" href={`/people/${next.slug}`}>
		<div class="container next-inner">
			<span class="eyebrow">Next person</span>
			<span class="display display-md next-name">{next.name}</span>
		</div>
	</a>
{/if}

<style>
	.person-detail {
		display: grid;
		grid-template-columns: 420px 1fr;
		gap: clamp(2rem, 5vw, 4rem);
		align-items: start;
		padding-top: clamp(3rem, 7vw, 5rem);
	}

	.person-photo img {
		aspect-ratio: 4 / 5;
		width: 100%;
		object-fit: cover;
		border-radius: var(--radius);
		border: 1px solid var(--line);
		filter: grayscale(30%);
	}

	.person-photo-empty {
		aspect-ratio: 4 / 5;
		border-radius: var(--radius);
		background: linear-gradient(135deg, #f0ece8, #e5ded8);
	}

	.person-name {
		margin-top: 0.9rem;
	}

	.roles {
		margin-top: 1.4rem;
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

	.bio {
		margin-top: 2rem;
		max-width: 640px;
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
		.person-detail {
			grid-template-columns: 1fr;
		}

		.person-photo {
			max-width: 420px;
		}
	}
</style>