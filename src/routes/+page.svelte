<script>
  import { onMount } from 'svelte';
  import Earth from '../components/Earth.svelte';
  import Horizon from '../components/Horizon.svelte';
  import { start } from '../lib/physics/physics';

  const input = {};
  const toggle = {};

  const onKeyDown = (e) => {
    input[e.key.toLowerCase()] = 1;
    toggle[e.key.toLowerCase()] = !toggle[e.key.toLowerCase()];
  };

  const onKeyUp = (e) => {
    input[e.key.toLowerCase()] = 0;
  };

  onMount(() => {
    start();
  });
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<main>
  <div class="column" style={toggle.x ? 'width:100%;' : ''}>
    <Earth />
  </div>
  <div class="column" style={`filter: invert(1); ${toggle.x ? 'width:0;' : ''}`}>
    <Horizon />
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: row;
    overflow: hidden;
  }

  .column {
    justify-content: center;
    width: 50%;
    height: 100vh;
    background-color: var(--background);
    transition: width 3s;
  }
</style>
