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

<main>Hello world.</main>

<style>
  main {
    width: min(100vw, 100vh);
    height: min(100vw, 100vh);
    color: white;
  }
</style>
