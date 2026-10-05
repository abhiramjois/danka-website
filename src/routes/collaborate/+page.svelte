<script lang="ts">
	type PageContent = { title: string; description: string };

	let { data }: { data: { page: PageContent | null } } = $props();

	const { page } = $derived(data);

	const projectTypes = ['Short film', 'Theatre', 'Music', 'Brand ads', 'Other'];

	let name = $state('');
	let email = $state('');
	let projectType = $state(projectTypes[0]);
	let message = $state('');
	let company = $state('');

	let status = $state<'idle' | 'sending' | 'sent'>('idle');
	let error = $state('');

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (status === 'sending') return;

		status = 'sending';
		error = '';

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name, email, projectType, message, company })
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok || !data.ok) {
				error = data.error || 'Something went wrong. Please try again.';
				status = 'idle';
				return;
			}

			status = 'sent';
			name = '';
			email = '';
			message = '';
			company = '';
		} catch {
			error = 'Could not reach the server. Check your connection and try again.';
			status = 'idle';
		}
	}
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

<section class="container section form-wrap">
	{#if status === 'sent'}
		<div class="sent" role="status">
			<h2 class="display display-md sent-title">Thank you</h2>
			<p class="muted">
				Your enquiry is on its way. We read everything that comes through and usually reply within a
				couple of days.
			</p>
			<button class="btn btn-solid submit" type="button" onclick={() => (status = 'idle')}>
				Send another
			</button>
		</div>
	{:else}
		<form class="contact-form" onsubmit={onSubmit}>
			<label class="field">
				<span class="field-label">Your name</span>
				<input type="text" name="name" bind:value={name} required placeholder="What should we call you?" />
			</label>

			<label class="field">
				<span class="field-label">Email</span>
				<input type="email" name="email" bind:value={email} required placeholder="you@example.com" />
			</label>

			<label class="field">
				<span class="field-label">What are you looking to make?</span>
				<select name="project-type" bind:value={projectType}>
					{#each projectTypes as type (type)}
						<option value={type}>{type}</option>
					{/each}
				</select>
			</label>

			<label class="field">
				<span class="field-label">Tell us about it</span>
				<textarea name="message" bind:value={message} rows="6" placeholder="Your idea, timeline, anything that helps us understand…"></textarea>
			</label>

			<label class="field honeypot" aria-hidden="true">
				<span class="field-label">Company</span>
				<input type="text" name="company" bind:value={company} tabindex="-1" autocomplete="off" />
			</label>

			{#if error}
				<p class="form-error" role="alert">{error}</p>
			{/if}

			<button class="btn btn-solid submit" type="submit" disabled={status === 'sending'}>
				{status === 'sending' ? 'Sending…' : 'Send enquiry'}
			</button>
		</form>
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

	.form-wrap {
		padding-top: 0;
		display: flex;
		justify-content: center;
	}

	.contact-form {
		width: 100%;
		max-width: 560px;
		display: flex;
		flex-direction: column;
		gap: 1.4rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.24em;
		color: var(--muted);
	}

	input,
	select,
	textarea {
		font-family: var(--sans);
		font-size: 1rem;
		font-weight: 300;
		color: var(--ink);
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 0.8rem 1rem;
		transition: border-color 0.15s ease;
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--muted-soft);
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.submit {
		align-self: flex-start;
		border: 0;
	}

	.submit:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.form-error {
		font-size: 0.88rem;
		color: #b4341f;
		border-left: 2px solid #b4341f;
		padding-left: 0.85rem;
	}

	/* Offscreen rather than display:none, which some bots skip. */
	.honeypot {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.sent {
		width: 100%;
		max-width: 560px;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.sent-title {
		margin: 0;
	}
</style>