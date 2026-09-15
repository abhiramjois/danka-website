<script lang="ts">
	import { marked } from 'marked';

	let { content = '', class: cls = '' } = $props();

	const html = $derived(marked.parse(content, { async: false }) as string);
</script>

<div class="rich {cls}">{@html html}</div>