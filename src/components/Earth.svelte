<script>
  import { earthTime } from '../lib/physics/physics';
  import { progression } from '../lib/stores/progression';
  import Box from './Box.svelte';
  import Intro from './Intro.svelte';
  import Research from './Research.svelte';
</script>

<Box title="Earth">
  <div class="column gap-medium">
    <div class="column gap-small">
      <p>Time: <span class="num">{$earthTime.toFixed(2)}</span>s</p>
    </div>
    <hr />
    <details>
      <summary>Horizon Mission Memo</summary>
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
