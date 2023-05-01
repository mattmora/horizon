<script>
  import Case from 'case';
  import { Engines, rocket } from '../lib/stores/rocket';
  import { progression } from '../lib/stores/progression';
  import Box from './Box.svelte';
  import { C, ZERO } from '../lib/physics/constants';
  import { lorentz, horizonTime } from '../lib/physics/physics';
  import { TaskIds, research } from '../lib/stores/research';
  import BigNumber from 'bignumber.js';
  import RadioGroup from './RadioGroup.svelte';
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

  const expand = () => {
    if (!rocket.tryExpand()) {
      postMessage('Not enough material.');
    }
  };

  const reduce = () => {
    if (!rocket.tryReduce()) {
      postMessage(`Fuel capture system is fully reduced.`);
    }
  };

  research.setCompleteCallback((task) => {
    postMessage(`Completed research: ${task.title}`);
  });

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
        {#each messages as message}
          <!-- <p transition:slide={{ duration: 300 }}>{`${message.timestamp} : ${message.text}`}</p> -->
          <p transition:slide={{ duration: 300 }}>{`${message.text}`}</p>
        {/each}
      </div>
    </div>

    <div class="column gap-small">
      <p>Time: <span class="num">{$horizonTime.toFixed(2)}</span>s</p>
      <p>Traveled: <span class="num">{$rocket.distance.toFixed(2)}</span>m</p>
      <p>
        Velocity: <span class="num">{$rocket.velocity.toFixed(2)}</span>m/s
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span class="inspectable" on:click={() => postMessage('C: The speed of light, 299792458m/s.')}
          >(<span class="num">{$rocket.velocity.times(100).div(C).toFixed(2)}%</span> C<sup>?</sup>)</span
        >
      </p>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <p
        class="inspectable"
        on:click={() =>
          postMessage(
            `Lorentz Factor: A quantification of how much time dilates and length contracts for Horizon, based on its velocity. As it increases, so do proper velocity and the relative passage of time on Earth.`,
          )}
      >
        Lorentz Factor<sup>?</sup>: <span class="num">{$lorentz.toPrecision(20)}</span>m/s
      </p>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <p
        class="inspectable"
        on:click={() =>
          postMessage('Proper Velocity: The speed of Horizon as observed from Earth. It can exceed the speed of light due to length contraction.')}
      >
        Proper Velocity<sup>?</sup>: <span class="num">{$lorentz.times($rocket.velocity).toFixed(2)}</span>m/s
      </p>
    </div>
    <hr />
    <div class="column gap-small">
      <p>Total Mass: <span class="num">{mass.toFixed(2)}</span>kg</p>
      <p>Free Material: <span class="num">{$rocket.material.toFixed(2)}</span>kg</p>
      <p>Fuel: <span class="num">{$rocket.fuel.toFixed(2)}</span>kg</p>
    </div>
    {#if $progression.unlocks[TaskIds.FUEL_CAPTURE]}
      <hr />
      {@const { step, mass, area, rate } = $rocket.capture}
      <div class="column gap-small">
        <h3>Fuel Capture Net: <span class="num">{area}</span>m<sup>2</sup></h3>
        <!-- <p>Turns out there's not much gas in space... Gonna need a really big net.</p> -->
        <div class="row gap-medium">
          <div class="row gap-small">
            <button on:click={() => expand()}>Expand (<span class="num">+{area.sqrt().plus(step).pow(2).minus(area)}</span>)</button>
            <button on:click={() => reduce()}
              >Reduce (<span class="num">-{area.isGreaterThan(0) ? area.minus(BigNumber.max(0, area.sqrt().minus(step).pow(2))) : 0}</span>)</button
            >
          </div>
        </div>
        <div class="row gap-medium">
          {#if $progression.unlocks[TaskIds.FUEL_CAPTURE_AUTOMATION]}
            <RadioGroup
              title="Auto"
              name={TaskIds.FUEL_CAPTURE_AUTOMATION}
              options={['expand', 'reduce', 'off']}
              bind:group={$rocket.capture.automation.mode}
            />
            <p>(ea. <span class="num">{$rocket.capture.automation.interval.toFixed(2)}</span>s)</p>
          {/if}
        </div>
        <p>
          Mass: <span class="num">{area.times(mass).toFixed(2)}</span>kg (<span class="num">{mass.toFixed(5)}</span>PU)
        </p>
        <p>
          Capture Rate: <span class="num">{rate.times(area).toExponential(2)}</span>kg/m of travel
        </p>
      </div>
    {/if}
    {#each engines as key}
      {#if $progression.unlocks[key]}
        {@const engine = $rocket.engines[key]}
        <hr />
        <div class="column gap-small">
          <h3>{Case.capital(key)} Engines: <span class="num">{engine.count}</span></h3>
          <div class="row gap-medium">
            <div class="row gap-small">
              <button on:click={() => build(key)}>Build</button>
              <button on:click={() => recycle(key)}>Recycle</button>
            </div>
          </div>
          <div class="row gap-medium">
            <!-- AUTOMATION INPUT -->
            {#if $progression.unlocks[TaskIds[key].AUTOMATION]}
              <RadioGroup title="Auto" name={TaskIds[key].AUTOMATION} options={['build', 'recycle', 'off']} bind:group={$rocket.engines[key].automation.mode} />
              <p>(ea. <span class="num">{$rocket.engines[key].automation.interval.toFixed(2)}</span>s)</p>
            {/if}
          </div>
          <!-- ENGINE STATS -->
          {#if engine.count > 0}
            <p>
              Mass: <span class="num">{engine.count.times(engine.mass).toFixed(2)}</span>kg (<span class="num">{engine.mass.toFixed(2)}</span>PU)
            </p>
            <p>
              Fuel Consumption: <span class="num">{engine.count.times(engine.consumption).toFixed(2)}</span>kg/s (<span class="num"
                >{engine.consumption.toFixed(2)}</span
              >PU)
            </p>
            <p>
              Output: <span class="num">{engine.count.times(engine.output)}</span>J/kg (<span class="num">{engine.output}</span>PU)
            </p>
            <!-- THROTTLE INPUT & INFO -->
            {@const efficiency = 1 - Math.sqrt(engine.throttle * 0.01) * engine.loss}
            <div class="row" style="justify-content: space-between;">
              <label for="{key}-throttle">
                <span class:emphasis-alt={!$progression.departed}>Engine Array Throttle:</span>
                <span class="num">{engine.throttle}%</span>
              </label>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <p
                class="inspectable"
                on:click={() =>
                  postMessage(`Propulsion Efficiency: The portion of output energy that can be converted to propulsive force at the current throttle.`)}
              >
                <span class="num">{(efficiency * 100).toFixed(1)}%</span> Propulsion Efficiency<sup>?</sup>
              </p>
            </div>
            <input type="range" min="0" max="100" class="slider" id="{key}-throttle" bind:value={$rocket.engines[key].throttle} />
            <p>
              Thrust: <span class="num">{engine.thrust.times($rocket.fuel > 0 ? 1 : 0).toFixed(0)}</span>N
            </p>
          {/if}
        </div>
      {/if}
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
    height: 120px;
    border: 1px solid var(--primary);
    background: var(--background);
    z-index: 1;
  }

  div.messages {
    /* position: absolute; */
    display: flex;
    flex-direction: column;
  }

  div.messages > p {
    padding: var(--space-xxsm) var(--space-xsm);
    color: var(--secondary);
    border-top: 1px dashed gray;
  }
</style>
