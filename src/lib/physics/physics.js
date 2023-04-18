import { rocket } from '../stores/rocket';
import BigNumber from 'bignumber.js';
import { C, CSQ, DECIMAL_PLACES, ONE, ZERO } from './constants';
import { get, writable } from 'svelte/store';

// process physics, does not store state
let previousTimestamp;
export const start = () => {
  previousTimestamp = performance.now();

  requestAnimationFrame(update);
};

export const lorentz = writable(ONE);
export const horizonTime = writable(ZERO);
export const earthTime = writable(ZERO);

const update = (timestamp) => {
  const delta = (timestamp - previousTimestamp) * 0.001;

  const { distance, velocity, mass, fuel, thrust, consumption } = rocket.getInfo();

  const newDistance = distance.plus(velocity.times(delta));

  lorentz.set(ONE.div(ONE.minus(velocity.pow(2).div(CSQ)).sqrt()));
  const mc2 = mass.times(CSQ);
  const currentK = get(lorentz).minus(1).times(mc2);

  const fuelConsumed = BigNumber.min(consumption.times(delta), fuel);
  const fueledDelta = consumption.isGreaterThan(0) ? fuelConsumed.div(consumption) : ZERO;

  const newK = currentK.plus(thrust.times(fueledDelta));
  const newVelocity = ONE.minus(ONE.div(newK.div(mc2).plus(1)).pow(2))
    .sqrt()
    .times(C);

  rocket.update({ distance: newDistance, velocity: newVelocity, fuel: fuel.minus(fuelConsumed) });

  horizonTime.set(get(horizonTime).plus(delta));
  earthTime.set(get(earthTime).plus(get(lorentz).times(delta)));

  previousTimestamp = timestamp;
  requestAnimationFrame(update);
};
