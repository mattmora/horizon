import { get, writable } from 'svelte/store';
import { progression } from './progression';
import { Engines, initialRocket, rocket } from './rocket';
import BigNumber from 'bignumber.js';
import { ZERO } from '../physics/constants';
import clone from 'just-clone';

export const TaskIds = {
  FUEL_COLLECTION: 'fuel-collection',
  COMBUSTION_MASS: 'combustion-mass',
  COMBUSTION_CONSUMPTION: 'combustion-consumption',
  COMBUSTION_EFFICIENCY: 'combustion-efficiency',
  FUSION_ENGINE: 'fusion-engine',
  FUSION_MASS: 'fusion-mass',
  FUSION_CONSUMPTION: 'fusion-consumption',
  FUSION_EFFICIENCY: 'fusion-efficiency',
  ANTIMATTER_ENGINE: 'antimatter-engine',
  ANTIMATTER_MASS: 'antimatter-mass',
  ANTIMATTER_CONSUMPTION: 'antimatter-consumption',
  ANTIMATTER_EFFICIENCY: 'antimatter-efficiency',
};

const Tasks = {
  [TaskIds.FUEL_COLLECTION]: {
    title: 'Fuel Capture',
    description: 'Develop system to capture ambient gases to use as fuel.',
    progress: ZERO,
    time: BigNumber(100),
    complete: function () {
      progression.unlock({ [TaskIds.FUEL_COLLECTION]: true });
    },
  },
  // COMBUSTION
  [TaskIds.COMBUSTION_MASS]: {
    title: 'Combustion Engine Mass',
    description: 'Reduce mass of combustion engines.',
    progress: ZERO,
    time: BigNumber(20),
    complete: function () {
      rocket.upgradeEngines(Engines.COMBUSTION, {
        mass: initialRocket.engines[Engines.COMBUSTION].mass * Math.pow(0.85, this.iteration),
      });
      research.createTask(TaskIds.COMBUSTION_MASS, this.iteration + 1);
    },
  },
  [TaskIds.COMBUSTION_CONSUMPTION]: {
    title: 'Combustion Engine Consumption',
    description: 'Increase fuel consumption rate of combustion engines.',
    progress: ZERO,
    time: BigNumber(20),
    complete: function () {
      rocket.upgradeEngines(Engines.COMBUSTION, {
        consumption: initialRocket.engines[Engines.COMBUSTION].consumption.plus(this.iteration * 30),
      });
      research.createTask(TaskIds.COMBUSTION_CONSUMPTION, this.iteration + 1);
    },
  },
  [TaskIds.COMBUSTION_EFFICIENCY]: {
    title: 'Combustion Engine Efficiency',
    description: 'Improve combustion engine efficiency as throttle increases.',
    progress: ZERO,
    time: BigNumber(20),
    complete: function () {
      rocket.upgradeEngines(Engines.COMBUSTION, {
        loss: initialRocket.engines[Engines.COMBUSTION].loss * Math.pow(0.9, this.iteration),
      });
      research.createTask(TaskIds.COMBUSTION_EFFICIENCY, this.iteration + 1);
    },
  },
  // FUSION
  [TaskIds.FUSION_ENGINE]: {
    title: 'Fusion Engine',
    description: '',
    progress: ZERO,
    time: BigNumber(100),
    complete: function () {
      progression.unlock({ [TaskIds.FUEL_COLLECTION]: true });
    },
  },
  // ANTIMATTER
  [TaskIds.ANTIMATTER_ENGINE]: {
    title: 'Antimatter Engine',
    description: '',
    progress: ZERO,
    time: BigNumber(100),
    complete: function () {
      progression.unlock({ [TaskIds.FUEL_COLLECTION]: true });
    },
  },
};

const initial = {
  available: {
    // [TaskIds.FUEL_COLLECTION]: Tasks[TaskIds.FUEL_COLLECTION],
    // [TaskIds.COMBUSTION_MASS]: Tasks[TaskIds.COMBUSTION_MASS],
    // [TaskIds.COMBUSTION_CONSUMPTION]: Tasks[TaskIds.COMBUSTION_CONSUMPTION],
    // [TaskIds.COMBUSTION_EFFICIENCY]: Tasks[TaskIds.COMBUSTION_EFFICIENCY],
  },
  active: {},
  completed: {},
};

const createResearch = () => {
  const store = writable(initial);
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update: (updated) => update((current) => ({ ...current, ...updated })),
    reset: () => set(initial),
    // TODO: don't separate iterations (specifically in completed tasks)?
    createTask: (taskBaseId, iteration) => {
      const { available } = get(store);
      // build task
      const task = clone(Tasks[taskBaseId]);
      task.iteration = iteration ?? 1;
      if (task.iteration > 1) task.title = `${task.title} ${task.iteration}`;
      task.time = task.time.times(Math.pow(1.1, task.iteration - 1));
      // make task available
      const taskId = `${taskBaseId}-${task.iteration}`;
      available[taskId] = task;
      update((data) => data);
    },
    setAvailable: (taskId) => {
      const { available, active } = get(store);
      available[taskId] = active[taskId];
      delete active[taskId];
      update((data) => data);
    },
    setActive: (taskId) => {
      const { active, available } = get(store);
      active[taskId] = available[taskId];
      update((data) => data);
    },
    setCompleted: (taskId) => {
      const { available, active, completed } = get(store);
      completed[taskId] = available[taskId];
      delete available[taskId];
      delete active[taskId];
      update((data) => data);
    },
  };
};

export const research = createResearch();
