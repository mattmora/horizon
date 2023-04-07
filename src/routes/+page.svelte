<script>
	import { onMount } from 'svelte';

	const input = {};
	const toggle = {};

	const onKeyDown = (e) => {
		input[e.key.toLowerCase()] = 1;
		toggle[e.key.toLowerCase()] = !toggle[e.key.toLowerCase()];
	};

	const onKeyUp = (e) => {
		input[e.key.toLowerCase()] = 0;
	};

	onMount(() => {});
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<div>Hello world.</div>

<style>
</style>
