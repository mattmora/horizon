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
    engines = Object.values(Engines).filter((key) => $progression.unlocks[key]);
    mass = rocket.getInfo().mass;
  }

  const build = (key) => {
    if (!rocket.tryBuild(key)) {
      postMessage('Not enough material.');
    }
  };

  const recycle = (key) => {
    if (!rocket.tryRecycle(key)) {
      postMessage(`No ${key} engines to recycle.`);
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
  <!-- <h6>FTL Communication Module</h6> -->
  <div class="column gap-medium">
    <div class="messages-container">
      <div class="messages">
        {#each messages as message (message.timestamp)}
          <p transition:slide={{ duration: 300 }}>{`${message.timestamp} : ${message.text}`}</p>
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
      <!-- <p>Total Mass: <span class="num">{mass.toFixed(2)}</span>kg</p> -->
      <p>Free Material: <span class="num">{$rocket.material}</span>kg</p>
      <p>Fuel: <span class="num">{$rocket.fuel.toFixed(2)}</span>kg</p>
    </div>
    {#each engines as key}
      <hr />
      {@const engine = $rocket.engines[key]}
      <div class="column gap-small">
        <div class="row gap-small">
          <button on:click={() => build(key)}>Build</button>
          <button on:click={() => recycle(key)}>Recycle</button>
          <h3>{Case.capital(key)} Engines: <span class="num">{engine.count}</span></h3>
        </div>
        <p>
          Mass: <span class="num">{engine.count.times(engine.mass)}</span>kg (<span class="num">{engine.mass}</span>PU)
        </p>
        <p>
          Fuel Consumption: <span class="num">{engine.count.times(engine.consumption)}</span>kg/s (<span class="num"
            >{engine.consumption}</span
          >PU)
        </p>
        <p>
          Output: <span class="num">{engine.count.times(engine.output)}</span>J/kg (<span class="num"
            >{engine.output}</span
          >PU)
        </p>
        {#if engine.count > 0}
          {@const efficiency = 1 - Math.sqrt(engine.throttle * 0.01) * engine.loss}
          <div class="row" style="justify-content: space-between;">
            <label for="{key}-throttle">
              <span class:emphasis-alt={!$progression.departed}>Engine Array Throttle:</span>
              <span class="num">{engine.throttle}%</span>
            </label>
            <p>
              <span class="num">{(efficiency * 100).toFixed(1)}%</span> Propulsion Efficiency
            </p>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            class="slider"
            id="{key}-throttle"
            bind:value={$rocket.engines[key].throttle}
          />
          <p>
            Thrust: <span class="num">{engine.thrust.times($rocket.fuel > 0 ? 1 : 0).toFixed(0)}</span>N
          </p>
        {/if}
      </div>
    {/each}
  </div>
</Box>

<style>
  div.messages-container {
    position: sticky;
    top: calc(var(--space-sm) * -1 - 1px);
    display: flex;
    flex-direction: column-reverse;
    overflow: auto;
    width: 100%;
    height: 80px;
    border: 1px solid var(--primary);
    background: var(--background);
  }

  div.messages {
    /* position: absolute; */
    display: flex;
    flex-direction: column;
  }

  div.messages > p {
    padding: var(--space-xxsm);
    color: var(--secondary);
  }

  h6 {
    position: absolute;
    top: 7px;
    left: 16px;
    z-index: 10;
    padding: 0 2px;
    height: 14px;
    background: var(--background);
    width: min(calc(100% - 32px), 138px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
