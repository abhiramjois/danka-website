<script lang="ts">
	const year = new Date().getFullYear();
	const links = [
		{ href: '/folio', label: 'Folio' },
		{ href: '/people', label: 'People' },
		{ href: '/collaborate', label: 'Collaborate' }
	];
</script>

<footer class="site-foot">
	<div class="container foot-inner">
		<div>
			<p class="foot-brand">Danka Studios</p>
			<p class="foot-tag muted-soft">An art collective — short films, theatre and music.</p>
		</div>

		<nav class="foot-nav" aria-label="Footer">
			{#each links as link (link.href)}
				<a href={link.href}>{link.label}</a>
			{/each}
		</nav>

		<p class="foot-copy muted-soft">&copy; {year} Danka Studios. All rights reserved.</p>
	</div>
</footer>

<style>
	.site-foot {
		border-top: 1px solid var(--line);
		padding-block: 2.5rem;
	}

	.foot-inner {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 2rem;
	}

	.foot-brand {
		font-size: 0.95rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}

	.foot-tag {
		font-size: 0.8rem;
		margin-top: 0.3rem;
	}

	.foot-nav {
		display: flex;
		gap: 1.8rem;
	}

	.foot-nav a {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.26em;
		color: var(--muted);
		transition: color 0.15s ease;
	}

	.foot-nav a:hover {
		color: var(--accent);
	}

	.foot-copy {
		font-size: 0.78rem;
		text-align: right;
	}

	@media (max-width: 720px) {
		.foot-inner {
			grid-template-columns: 1fr;
			gap: 1.25rem;
		}

		.foot-copy {
			text-align: left;
		}
	}
</style>