<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeScroll } from '#lib/scroll/index.ts';
	import '../app.css';

	let { children } = $props();

	onMount(initializeScroll);
</script>

{@render children()}
