<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Oops — Danka Studios</title>
</svelte:head>

<div class="container error-wrp">
	<p class="display display-xl error-code">{page.status}</p>
	<h1 class="display display-md">{page.status === 404 ? 'Not found' : 'Something went wrong'}</h1>
	<p class="muted">The page you are looking for does not exist or has moved.</p>
	<a class="btn btn-outline error-btn" href="/">Back home</a>
</div>

<style>
	.error-wrp {
		min-height: 70vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 1rem;
	}

	.error-code {
		font-size: clamp(5rem, 18vw, 9rem);
	}

	.error-btn {
		margin-top: 1rem;
	}
</style>