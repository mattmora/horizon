import { get, writable } from 'svelte/store';
import BigNumber from 'bignumber.js';
import { CSQ, DECIMAL_PLACES, ONE, ZERO } from '../physics/constants';
import clone from 'just-clone';

export const Engines = {
  COMBUSTION: 'combustion',
  FUSION: 'fusion',
  ANTIMATTER: 'antimatter',
};

export const initialRocket = {
  material: BigNumber(1000000),
  fuel: BigNumber(1000000),
  capture: {
    count: ZERO,
    step: 2,
    mass: BigNumber(0.5),
    area: ZERO,
    // rate: BigNumber('1.4e-22'),
    rate: BigNumber('1.4e-12'),
    automation: {
      mode: 'off',
      interval: 1,
      timer: 0,
    },
  },
  engines: {
    [Engines.COMBUSTION]: {
      count: BigNumber(10),
      mass: BigNumber(500),
      output: BigNumber('140000000'),
      consumption: BigNumber(30),
      loss: 0.75,
      throttle: 0,
      thrust: ZERO,
      automation: {
        mode: 'off',
        interval: 1,
        timer: 0,
      },
    },
    [Engines.FUSION]: {
      count: BigNumber(0),
      mass: BigNumber(5000),
      output: BigNumber('640000000000000'),
      consumption: BigNumber(10),
      loss: 0.75,
      throttle: 0,
      thrust: ZERO,
      automation: {
        mode: 'off',
        interval: 1,
        timer: 0,
      },
    },
    [Engines.ANTIMATTER]: {
      count: BigNumber(0),
      mass: BigNumber(25000),
      output: CSQ,
      consumption: BigNumber(1),
      loss: 0.75,
      throttle: 0,
      thrust: ZERO,
      automation: {
        mode: 'off',
        interval: 1,
        timer: 0,
      },
    },
  },
  velocity: ZERO,
  distance: ZERO,
};

const createRocket = () => {
  const store = writable(clone(initialRocket));
  const { subscribe, set, update } = store;

  const tryBuild = (key, tryCount = 1) => {
    const { material, engines } = get(store);
    const possible = BigNumber.max(1, material.dividedToIntegerBy(engines[key].mass));
    const count = BigNumber.min(possible, tryCount);
    if (material.isGreaterThanOrEqualTo(engines[key].mass * count)) {
      engines[key].count = engines[key].count.plus(count);
      get(store).material = material.minus(engines[key].mass * count);
      update((data) => data);
      return true;
    }
    return false;
  };

  const tryRecycle = (key, tryCount = 1) => {
    const { material, engines } = get(store);
    if (engines[key].count.isGreaterThan(0)) {
      const count = BigNumber.min(engines[key].count, tryCount);
      engines[key].count = engines[key].count.minus(count);
      get(store).material = material.plus(engines[key].mass * count);
      update((data) => data);
      return true;
    }
    return false;
  };

  const tryExpand = (tryCount = 1) => {
    if (tryCount < 1) return true;
    const { material, capture } = get(store);
    const { mass, area } = capture;
    const possible = BigNumber.max(1, material.div(mass).plus(area).sqrt().minus(area.sqrt()).div(capture.step).integerValue(BigNumber.ROUND_FLOOR));
    const count = BigNumber.min(possible, tryCount);
    // console.log(count);
    const step = count * capture.step;
    const cost = area.sqrt().plus(step).pow(2).minus(area).times(mass);
    if (material.isGreaterThanOrEqualTo(cost)) {
      capture.count = capture.count.plus(count);
      capture.area = area.sqrt().plus(step).pow(2);
      get(store).material = material.minus(cost);
      update((data) => data);
      return true;
    }
    return false;
  };

  const tryReduce = (tryCount = 1) => {
    if (tryCount < 1) return true;
    const { material, capture } = get(store);
    const { mass, area } = capture;
    if (area.isGreaterThan(0)) {
      const count = BigNumber.min(capture.count, tryCount);
      const step = count * capture.step;
      const newArea = area.sqrt().minus(step).pow(2);
      const cost = area.minus(newArea).times(mass);
      get(store).material = material.plus(cost);
      capture.count = capture.count.minus(count);
      capture.area = newArea;
      update((data) => data);
      return true;
    }
    return false;
  };

  return {
    subscribe,
    set,
    update: (updated) => update((current) => ({ ...current, ...updated })),
    reset: () => set(clone(initialRocket)),
    getInfo: () => {
      const { material, fuel, engines, velocity, distance, capture } = get(store);
      let mass = fuel.plus(material);
      let thrust = BigNumber(0);
      let consumption = BigNumber(0);
      Object.values(engines).forEach((e) => {
        if (e.count.isEqualTo(0)) e.throttle = 0;
        const throttle = e.throttle * 0.01;
        const efficiency = 1 - Math.sqrt(throttle) * e.loss;
        mass = mass.plus(e.count.times(e.mass));
        e.thrust = e.count.times(e.output).times(e.count).times(e.consumption).times(throttle).times(efficiency);
        thrust = thrust.plus(e.thrust);
        // thrust = thrust.plus(e.count.times(e.unitEnergy.div(CSQ)).times(throttle));
        consumption = consumption.plus(e.count.times(e.consumption).times(throttle));
      });
      mass = mass.plus(capture.area.times(capture.mass));
      return { distance, velocity, fuel, mass, thrust, consumption, capture };
    },
    tryBuild,
    tryRecycle,
    tryExpand,
    tryReduce,
    upgradeCapture: (upgrade) => {
      const { capture } = get(store);
      const count = capture.count;
      tryReduce(count);
      get(store).capture = {
        ...get(store).capture,
        ...upgrade,
      };
      tryExpand(count);
    },
    upgradeEngines: (key, upgrade) => {
      const { engines } = get(store);
      const count = engines[key].count;
      tryRecycle(key, count);
      engines[key] = {
        ...engines[key],
        ...upgrade,
      };
      tryBuild(key, count);
    },
  };
};

export const rocket = createRocket();
