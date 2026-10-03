<script lang="ts">
	type PageContent = { title: string; description: string };

	let { data }: { data: { page: PageContent | null } } = $props();

	const { page } = $derived(data);

	const CONTACT_EMAIL = 'hello@dankastudios.com';

	const projectTypes = ['Short film', 'Theatre', 'Music', 'Brand ads', 'Other'];

	let name = $state('');
	let email = $state('');
	let projectType = $state(projectTypes[0]);
	let message = $state('');

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		const subject = encodeURIComponent(`Collaboration enquiry — ${name}`);
		const body = encodeURIComponent(
			`Name: ${name}\nEmail: ${email}\nProject type: ${projectType}\n\nMessage:\n${message}`
		);
		window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
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

		<button class="btn btn-solid submit" type="submit">Send enquiry</button>
		<p class="muted-soft form-hint">Opens your email app with the details filled in.</p>
	</form>
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

	.form-hint {
		font-size: 0.82rem;
	}
</style>