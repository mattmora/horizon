<script>
  import { ONE } from '../lib/physics/constants';
  import { multitaskFactor } from '../lib/physics/physics';
  import { research } from '../lib/stores/research';
</script>

<div>
  <h2>Research Tasks</h2>
  <div class="row gap-medium">
    <div class="column gap-small" style="width:70%">
      <h3>Available</h3>
      {#each Object.keys($research.available) as taskId (taskId)}
        {@const task = $research.active[taskId] ?? $research.available[taskId]}
        <button on:click={() => research.setActive(taskId)} disabled={$research.active[taskId]}>
          <p>
            <b>{task.title}:</b>
            <span class="plain"
              >{task.description}
              (<span class="num">{task.progress.div(task.time).times(100).toFixed(2)}%</span>)</span
            >
          </p>
        </button>
      {/each}
    </div>
    <div class="vr" />
    <div class="column gap-small">
      <div class="row">
        <h3>Researching</h3>
      </div>
      {#each Object.keys($research.active) as taskId (taskId)}
        {@const task = $research.active[taskId]}
        {@const rate = ONE.times(100).div(task.time).times($multitaskFactor)}
        {@const formattedRate = rate.isLessThan(0.01) ? (rate.isLessThan(0.0001) ? rate.toExponential(1) : rate.toFixed(4)) : rate.toFixed(2)}
        <button on:click={() => research.setAvailable(taskId)}
          ><p>
            <b>{task.title}</b> <span class="plain"> (<span class="num">{formattedRate}%</span> per second)</span>
          </p>
        </button>
      {/each}
    </div>
    <div class="vr" />
    <div class="column gap-small">
      <h3>Completed</h3>
      {#each Object.keys($research.completed) as taskId (taskId)}
        {@const task = $research.completed[taskId]}
        <button class="no-interact" disabled><p><b>{task.title}</b></p> </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .row {
    align-items: start;
  }

  .column {
    width: 50%;
  }

  div.vr {
    width: 0px;
    height: 100px;
    border-left: 1px solid var(--primary);
  }

  b {
    font-style: italic;
  }

  .plain {
    color: var(--copy);
  }
</style>
