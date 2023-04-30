<script>
  export let title = 'Auto';
  export let name = '';
  export let options = [];
  export let group; //binding
</script>

<p>{title}:</p>
{#each options as option}
  <div class="row gap-small">
    <input type="radio" id="{name}-{option}" {name} value={option} bind:group /><label class="radio-label" for="{name}-{option}">{option}</label>
  </div>
{/each}

<style>
  label {
    text-transform: capitalize;
  }
</style>
