import { rocket } from '../stores/rocket';
import BigNumber from 'bignumber.js';
import { C, CSQ, HOUR, ONE, TIME_UNIT, ZERO } from './constants';
import { get, writable } from 'svelte/store';
import { progression } from '../stores/progression';
import { TaskIds, Tasks, research } from '../stores/research';

// process physics, does not store state
export const lastUpdate = writable(0);
export const start = () => {
  if (get(lastUpdate) == 0) lastUpdate.set(Date.now());

  requestAnimationFrame(update);
};

export const lorentz = writable(ONE);
export const horizonTime = writable(ZERO);
export const earthTime = writable(ZERO);
export const multitaskFactor = writable(1);

const update = () => {
  const timestamp = Date.now();
  const delta = TIME_UNIT.times((timestamp - get(lastUpdate)) * 0.001);

  const info = rocket.getInfo();
  if (info.thrust.isGreaterThan(0) && !get(progression).departed) {
    progression.update({ departed: true });
    research.initialize();
  }
  if (get(progression).departed) process(delta, info);

  lastUpdate.set(timestamp);
  requestAnimationFrame(update);
};

const process = (delta, { distance, velocity, mass, fuel, thrust, consumption, capture }) => {
  lorentz.set(ONE.div(ONE.minus(velocity.pow(2).div(CSQ)).sqrt()));
  const lorentzFactor = get(lorentz);
  const traveled = velocity.times(delta).times(lorentzFactor);
  const newDistance = distance.plus(traveled);

  const fuelCaptured = capture.area.times(capture.rate).times(traveled);
  const fuelConsumed = BigNumber.min(consumption.times(delta), fuel.plus(fuelCaptured));
  const fueledDelta = consumption.isGreaterThan(0) ? fuelConsumed.div(consumption) : ZERO;

  const currentK = lorentzFactor.minus(1).times(mass).times(CSQ);

  const newK = currentK.plus(thrust.times(fueledDelta));
  const newVelocity = ONE.minus(ONE.div(newK.div(mass.plus(fuelCaptured).times(CSQ)).plus(1)).pow(2))
    .sqrt()
    .times(C);

  rocket.update({ distance: newDistance, velocity: newVelocity, fuel: fuel.plus(fuelCaptured).minus(fuelConsumed) });

  const numDelta = +delta;
  const { engines } = get(rocket);
  Object.keys(engines).forEach((key) => {
    const { automation } = engines[key];
    if (automation.mode !== 'off') {
      if (automation.timer >= automation.interval) {
        const count = Math.floor(automation.timer / automation.interval);
        if (automation.mode === 'build') rocket.tryBuild(key, count);
        else if (automation.mode === 'recycle') rocket.tryRecycle(key, count);
        automation.timer -= automation.interval * count;
      }
      automation.timer += numDelta;
    }
  });
  const { automation } = capture;
  if (automation.mode !== 'off') {
    if (automation.timer >= automation.interval) {
      const count = Math.floor(automation.timer / automation.interval);
      if (automation.mode === 'expand') rocket.tryExpand(count);
      else if (automation.mode === 'reduce') rocket.tryReduce(count);
      automation.timer -= automation.interval * count;
    }
    automation.timer += numDelta;
  }

  horizonTime.set(get(horizonTime).plus(delta.div(TIME_UNIT)));

  const earthDelta = lorentzFactor.times(delta);
  const { active, completed } = get(research);
  const activeTaskIds = Object.keys(active);
  multitaskFactor.set(1 / Math.sqrt(activeTaskIds.length));
  activeTaskIds.forEach((taskId) => {
    const task = active[taskId];
    task.progress = task.progress.plus(earthDelta.times(get(multitaskFactor)));
    if (task.progress.isGreaterThan(task.time)) {
      research.setCompleted(taskId);
      if (Object.keys(completed).length >= 3 && !get(progression).unlocks[TaskIds.RESEARCH_AUTOMATION]) {
        console.log(completed);
        research.createTask(TaskIds.RESEARCH_AUTOMATION);
      }
      Tasks[taskId].complete(task);
    }
  });
  research.update((data) => data);
  earthTime.set(get(earthTime).plus(earthDelta.div(TIME_UNIT)));
};
