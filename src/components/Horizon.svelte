<script>
  import Case from 'case';
  import { Engines, rocket } from '../lib/stores/rocket';
  import { progression } from '../lib/stores/progression';
  import Box from './Box.svelte';
  import { ZERO } from '../lib/physics/constants';
  import { lorentz, horizonTime } from '../lib/physics/physics';
  import { slide } from 'svelte/transition';

  let engines = [];
  let mass = ZERO;
  $: {
    $rocket;
    engines = Object.values(Engines).filter((key) => $progression.unlocks.engines[key]);
    mass = rocket.getInfo().mass;
  }

  const build = (key) => {
    if (!rocket.tryBuild(key)) {
      postMessage('Not enough material.');
    }
  };

  let messages = [];
  const postMessage = (message) => {
    console.log(message);
    messages.push({ text: message, timestamp: Date.now() });
    if (messages.length > 100) messages.shift();
    // else {
    //   setTimeout(() => {
    //     messages.shift();
    //     messages = messages;
    //   }, 3000);
    // }
    messages = messages;
  };
</script>

<Box title="Horizon">
  <div class="column gap-medium">
    <div class="messages-container">
      <div class="messages">
        {#each messages as message (message.timestamp)}
          <div transition:slide={{ duration: 300 }}>
            <p>{message.timestamp} : {message.text}</p>
          </div>
        {/each}
      </div>
    </div>

    <div class="column gap-small">
      <p>Time: <span class="num">{$horizonTime.toFixed(2)}</span>s</p>
      <p>Distance: <span class="num">{$rocket.distance.toFixed(2)}</span>m</p>
      <p>Velocity: <span class="num">{$rocket.velocity.toFixed(2)}</span>m/s</p>
      <p>Lorentz Factor: <span class="num">{$lorentz.toPrecision(20)}</span>m/s</p>
    </div>
    <hr />
    <div class="column gap-small">
      <h3>Payload</h3>
      <p>Total Mass: <span class="num">{mass.toFixed(2)}</span>kg</p>
      <p>Material: <span class="num">{$rocket.material.toFixed(2)}</span>kg</p>
      <p>Fuel: <span class="num">{$rocket.fuel.toFixed(2)}</span>kg</p>
    </div>
    {#each engines as key}
      <hr />
      {@const engine = $rocket.engines[key]}
      <div class="column gap-small">
        <div class="row gap-small">
          <button on:click={() => build(key)}>Build</button>
          <h3>{Case.capital(key)} Engines: <span class="num">{engine.count}</span></h3>
        </div>
        <div class="row gap-medium">
          <p>Unit Mass: <span class="num">{engine.mass}</span>kg</p>
          <p>Unit Fuel Consumption: <span class="num">{engine.consumption}</span>kg/s</p>
        </div>
        {#if engine.count > 0}
          <label for="{key}-throttle">Engine Array Throttle: <span class="num">{engine.throttle}%</span></label>
          <input
            type="range"
            min="0"
            max="100"
            class="slider"
            id="{key}-throttle"
            bind:value={$rocket.engines[key].throttle}
          />
        {/if}
      </div>
    {/each}
  </div>
</Box>

<style>
  div.messages-container {
    position: sticky;
    top: 0px;
    display: flex;
    flex-direction: column-reverse;
    overflow: auto;
    width: 100%;
    height: 100px;
    border: 1px solid var(--primary);
  }

  div.messages {
    /* position: absolute; */
    display: flex;
    flex-direction: column;
    background: var(--background);
    opacity: 0.9;
  }

  div.messages > div {
    /* padding: var(--space-xsm); */
    color: var(--secondary);
  }
</style>
