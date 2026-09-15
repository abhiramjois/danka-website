<script lang="ts">
	let open = $state(false);
	const links = [
		{ href: '/folio', label: 'Folio' },
		{ href: '/people', label: 'People' },
		{ href: '/collaborate', label: 'Collaborate' }
	];
</script>

<header class="site-head">
	<div class="container head-inner">
		<a href="/" class="brand" aria-label="Danka Studios — home">
			Danka<span class="brand-mark">Studios</span>
		</a>

		<nav class="nav" aria-label="Primary">
			{#each links as link (link.href)}
				<a href={link.href} class="nav-link">{link.label}</a>
			{/each}
			<a class="nav-cta" href="/collaborate">Work with us</a>
		</nav>

		<button
			class="burger"
			aria-label="Toggle menu"
			aria-expanded={open}
			onclick={() => (open = !open)}
		>
			<span></span><span></span>
		</button>
	</div>

	{#if open}
		<nav class="mobile-nav" aria-label="Mobile">
			{#each links as link (link.href)}
				<a href={link.href} class="mobile-link" onclick={() => (open = false)}>{link.label}</a>
			{/each}
			<a href="/collaborate" class="mobile-cta" onclick={() => (open = false)}>Work with us</a>
		</nav>
	{/if}
</header>

<style>
	.site-head {
		position: relative;
		border-bottom: 1px solid var(--line);
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		z-index: 50;
	}

	.head-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: 1.1rem;
		gap: 1rem;
	}

	.brand {
		font-family: var(--sans);
		font-size: 1rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		font-weight: 500;
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
	}

	.brand-mark {
		color: var(--muted);
		font-weight: 300;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 2.2rem;
	}

	.nav-link {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.26em;
		color: var(--muted);
		position: relative;
		transition: color 0.15s ease;
	}

	.nav-link:hover {
		color: var(--accent);
	}

	.nav-link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -4px;
		height: 1px;
		width: 0;
		background: var(--accent);
		transition: width 0.2s ease;
	}

	.nav-link:hover::after {
		width: 100%;
	}

	.nav-cta {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.26em;
		color: #120d0d;
		background: var(--accent);
		padding: 0.55rem 1.15rem;
		border-radius: 999px;
		transition: background 0.15s ease;
	}

	.nav-cta:hover {
		background: #e08b82;
	}

	.burger {
		display: none;
		flex-direction: column;
		gap: 6px;
		background: none;
		border: 0;
		padding: 4px;
	}

	.burger span {
		width: 22px;
		height: 2px;
		background: var(--text);
	}

	.mobile-nav {
		padding: 1rem 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border-top: 1px solid var(--line);
	}

	.mobile-link {
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.26em;
	}

	.mobile-cta {
		align-self: flex-start;
		background: var(--accent);
		color: #120d0d;
		padding: 0.6rem 1.2rem;
		border-radius: 999px;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.26em;
	}

	@media (max-width: 720px) {
		.nav {
			display: none;
		}

		.burger {
			display: flex;
		}
	}
</style>