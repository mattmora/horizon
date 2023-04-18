import { get, writable } from 'svelte/store';
import BigNumber from 'bignumber.js';
import { DECIMAL_PLACES, ONE, ZERO } from '../physics/constants';

export const Engines = {
  COMBUSTION: 'combustion',
  FUSION: 'fusion',
  ANTIMATTER: 'antimatter',
};

const initial = {
  material: new BigNumber(100000),
  fuel: new BigNumber(100000),
  engines: {
    [Engines.COMBUSTION]: {
      count: ZERO,
      mass: 2000,
      thrust: new BigNumber('5e8'),
      consumption: 50,
      throttle: 0,
    },
  },
  velocity: ZERO,
  distance: ZERO,
};

const createRocket = () => {
  const store = writable(initial);
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update: (updated) => update((current) => ({ ...current, ...updated })),
    reset: () => set(initial),
    getInfo: () => {
      const { material, fuel, engines, velocity, distance } = get(store);
      let mass = fuel.plus(material);
      let thrust = new BigNumber(0);
      let consumption = new BigNumber(0);
      Object.values(engines).forEach((e) => {
        const throttle = e.throttle * 0.01;
        mass = mass.plus(e.count.times(e.mass));
        thrust = thrust.plus(e.count.times(e.thrust).times(throttle));
        consumption = consumption.plus(e.count.times(e.consumption).times(throttle));
      });
      return { distance, velocity, fuel, mass, thrust, consumption };
    },
    tryBuild: (key) => {
      const { material, engines } = get(store);
      if (material.isGreaterThanOrEqualTo(engines[key].mass)) {
        engines[key].count = engines[key].count.plus(1);
        get(store).material = material.minus(engines[key].mass);
        return true;
      }
      return false;
    },
  };
};

export const rocket = createRocket();
