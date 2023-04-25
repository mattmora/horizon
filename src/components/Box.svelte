<script>
  export let title = '';
  export let style = '';
  export let border = '4px double black';

  const boxStyle = `border:${border}`;
</script>

<div class="box-container" {style}>
  <h1 class="title">{title}</h1>
  <div class="box" style={boxStyle}>
    <slot />
  </div>
</div>

<style>
  .box-container {
    display: flex;
    flex-direction: column;
    width: max(min(100%, 50vw), 0vw);
    height: 94%;
    padding: 0 max(min(8%, 4vw), 0vw);
    margin: auto;
  }

  .title {
    text-align: center;
  }

  .box {
    position: relative;
    height: 90%;
    padding: var(--space-sm);
    /* aspect-ratio: 1 / 1; */
    overflow-y: scroll;
    overflow-x: auto;
  }
</style>
