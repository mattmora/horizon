<script>
  import { progression } from '../lib/stores/progression';
</script>

<div class="column gap-medium">
  <p>Spacecraft Horizon is in orbit and ready for departure.</p>
  <p>As its crew, you will explore the furthest reaches of the universe.</p>
  <p>
    We've provided you with significant amounts of building material, as well as some starting engines and fuel, and we
    hope to provide you the means to collect more.
  </p>
  <p>
    We will immediately begin research into such technologies to maintain and accelerate your expedition and we will
    provide you with instructions to build them via our recently developed faster-than-light communication.
  </p>
  <!-- <p style="color:var(--primary);">Godspeed on your journey to end.</p> -->
  <p><span class:emphasis={!$progression.departed}>Engage your engine throttle to depart.</span></p>
</div>
