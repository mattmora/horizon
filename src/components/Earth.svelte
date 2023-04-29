<script>
  import { earthTime, lorentz } from '../lib/physics/physics';
  import { progression } from '../lib/stores/progression';
  import Box from './Box.svelte';
  import Intro from './Intro.svelte';
  import Research from './Research.svelte';
</script>

<Box title="Earth">
  <div class="column gap-medium">
    <div class="column gap-small">
      {#if $lorentz.isLessThan(1.01)}
        <p>Time: <span class="num">{$earthTime.toFixed(2)}</span>s</p>
      {:else}
        <p>Time: <span class="num">{$earthTime.toFixed(2)}</span>s (passing at {$lorentz.toFixed(2)}x Horizon time)</p>
      {/if}
    </div>
    <hr />
    <details>
      <summary><span class:emphasis={!$progression.departed}>Horizon Mission Memo</span></summary>
      <Intro />
    </details>
    <hr />
    <Research />
  </div>
</Box>

<style>
  details > summary {
    cursor: pointer;
  }

  details[open] > summary {
    padding-bottom: var(--space-xsm);
  }
</style>
