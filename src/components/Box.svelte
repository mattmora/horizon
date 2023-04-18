<script>
  export let title = '';
  export let style = '';
  export let border = '4px double black';

  const boxStyle = `border:${border}`;
</script>

<div class="box-container" {style}>
  <h2 class="title">{title}</h2>
  <div class="box" style={boxStyle}>
    <slot />
  </div>
</div>

<style>
  .box-container {
    display: flex;
    flex-direction: column;
    width: max(min(100%, 50vw), 0vw);
    height: 90%;
    padding: 0 max(min(10%, 5vw), 0vw);
    margin: auto;
  }

  .title {
    text-align: center;
  }

  .box {
    height: 90%;
    padding: var(--space-sm);
    /* aspect-ratio: 1 / 1; */
    overflow: auto;
  }
</style>
