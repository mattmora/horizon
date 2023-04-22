import { rocket } from '../stores/rocket';
import BigNumber from 'bignumber.js';
import { C, CSQ, HOUR, ONE, TIME_UNIT, ZERO } from './constants';
import { get, writable } from 'svelte/store';
import { progression } from '../stores/progression';
import { TaskIds, research } from '../stores/research';

// process physics, does not store state
let previousTimestamp;
export const start = () => {
  previousTimestamp = performance.now();

  requestAnimationFrame(update);
};

export const lorentz = writable(ONE);
export const horizonTime = writable(ZERO);
export const earthTime = writable(ZERO);
export const multitaskFactor = writable(1);

const update = (timestamp) => {
  const delta = TIME_UNIT.times((timestamp - previousTimestamp) * 0.001);

  const info = rocket.getInfo();
  if (info.thrust.isGreaterThan(0) && !get(progression).departed) {
    progression.update({ departed: true });
    research.createTask(TaskIds.FUEL_COLLECTION);
    research.createTask(TaskIds.COMBUSTION_MASS);
    research.createTask(TaskIds.COMBUSTION_CONSUMPTION);
    research.createTask(TaskIds.COMBUSTION_EFFICIENCY);
  }
  if (get(progression).departed) process(delta, info);

  previousTimestamp = timestamp;
  requestAnimationFrame(update);
};

const process = (delta, { distance, velocity, mass, fuel, thrust, consumption }) => {
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

  horizonTime.set(get(horizonTime).plus(delta.div(TIME_UNIT)));

  const earthDelta = get(lorentz).times(delta);
  const active = get(research).active;
  const taskIds = Object.keys(active);
  multitaskFactor.set(1 / Math.sqrt(taskIds.length));
  taskIds.forEach((taskId) => {
    const task = active[taskId];
    task.progress = task.progress.plus(earthDelta.times(get(multitaskFactor)));
    if (task.progress.isGreaterThan(task.time)) {
      task.complete();
      research.setCompleted(taskId);
    }
  });
  research.update((data) => data);
  earthTime.set(get(earthTime).plus(earthDelta.div(TIME_UNIT)));
};
