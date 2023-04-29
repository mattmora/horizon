<script>
  import { onMount } from 'svelte';
  import Earth from '../components/Earth.svelte';
  import Horizon from '../components/Horizon.svelte';
  import { earthTime, horizonTime, lorentz, multitaskFactor, start } from '../lib/physics/physics';
  import { progression } from '../lib/stores/progression';
  import { research } from '../lib/stores/research';
  import { Engines, rocket } from '../lib/stores/rocket';
  import { ONE, ZERO } from '../lib/physics/constants';
  import { loadState, saveState } from '../lib/storage';
  import { get } from 'svelte/store';

  const input = {};
  const toggle = {};

  const onKeyDown = (e) => {
    input[e.key.toLowerCase()] = 1;
    toggle[e.key.toLowerCase()] = !toggle[e.key.toLowerCase()];
  };

  const onKeyUp = (e) => {
    input[e.key.toLowerCase()] = 0;
  };

  let optionsVisible = false;
  const toggleOptions = () => {
    optionsVisible = !optionsVisible;
  };

  const reset = () => {
    progression.reset();
    research.reset();
    rocket.reset();
    lorentz.set(ONE);
    horizonTime.set(ZERO);
    earthTime.set(ZERO);
    multitaskFactor.set(1);
    optionsVisible = false;
  };

  onMount(() => {
    loadState();
    setInterval(saveState, 1000);
    start();
  });
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<main>
  <div class="options">
    <button class="toggle" on:click={toggleOptions}>&#9776;</button>
    {#if optionsVisible}
      <button on:click={reset}>Reset</button>
    {/if}
  </div>
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

  .options {
    position: absolute;
    top: 4px;
    left: 4px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .toggle {
    font-weight: bold;
    width: 32px;
    height: 32px;
    padding: 0;
    text-align: center;
  }
</style>
