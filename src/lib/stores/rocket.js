import { get, writable } from 'svelte/store';
import BigNumber from 'bignumber.js';
import { DECIMAL_PLACES, ONE, ZERO } from '../physics/constants';
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
    mass: ONE,
    area: ZERO,
    // rate: BigNumber('1.4e-22'),
    rate: BigNumber('1.4e-12'),
  },
  engines: {
    [Engines.COMBUSTION]: {
      count: BigNumber(5),
      mass: 500,
      output: BigNumber(140000000),
      consumption: BigNumber(10),
      loss: 0.75,
      throttle: 0,
      thrust: ZERO,
    },
  },
  velocity: ZERO,
  distance: ZERO,
};

const createRocket = () => {
  const store = writable(clone(initialRocket));
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update: (updated) => update((current) => ({ ...current, ...updated })),
    reset: () => set(initialRocket),
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
      return { distance, velocity, fuel, mass, thrust, consumption, capture };
    },
    tryBuild: (key) => {
      const { material, engines } = get(store);
      if (material.isGreaterThanOrEqualTo(engines[key].mass)) {
        engines[key].count = engines[key].count.plus(1);
        get(store).material = material.minus(engines[key].mass);
        update((data) => data);
        return true;
      }
      return false;
    },
    tryRecycle: (key) => {
      const { material, engines } = get(store);
      if (engines[key].count.isGreaterThan(0)) {
        engines[key].count = engines[key].count.minus(1);
        get(store).material = material.plus(engines[key].mass);
        update((data) => data);
        return true;
      }
      return false;
    },
    tryExpand: () => {
      const { material, capture } = get(store);
      const { mass, area } = capture;
      const cost = area.sqrt().plus(1).pow(2).minus(area).times(mass);
      if (material.isGreaterThanOrEqualTo(cost)) {
        capture.area = area.sqrt().plus(1).pow(2);
        get(store).material = material.minus(cost);
        update((data) => data);
        return true;
      }
      return false;
    },
    tryReduce: () => {
      const { material, capture } = get(store);
      const { mass, area } = capture;
      if (area.isGreaterThan(0)) {
        const newArea = area.sqrt().minus(1).pow(2);
        const cost = area.minus(newArea).times(mass);
        get(store).material = material.plus(cost);
        capture.area = newArea;
        update((data) => data);
        return true;
      }
      return false;
    },
    upgradeEngines: (key) => {},
  };
};

export const rocket = createRocket();
