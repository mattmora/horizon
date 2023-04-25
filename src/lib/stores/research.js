import { get, writable } from 'svelte/store';
import { progression } from './progression';
import { Engines, initialRocket, rocket } from './rocket';
import BigNumber from 'bignumber.js';
import { ZERO } from '../physics/constants';
import clone from 'just-clone';

export const TaskIds = {
  RESEARCH_AUTOMATION: 'research-automation',
  FUEL_MATERIAL_CONVERSION: 'fuel-material-conversion',
  FUEL_CAPTURE: 'fuel-capture',
  FUEL_CAPTURE_AUTOMATION: 'fuel-capture-automation',
  FUEL_CAPTURE_MASS: 'fuel-capture-mass',
  COMBUSTION_AUTOMATION: 'combustion-automation',
  COMBUSTION_MASS: 'combustion-mass',
  COMBUSTION_CONSUMPTION: 'combustion-consumption',
  COMBUSTION_EFFICIENCY: 'combustion-efficiency',
  FUSION_ENGINE: 'fusion-engine',
  FUSION_AUTOMATION: 'fusion-automation',
  FUSION_MASS: 'fusion-mass',
  FUSION_CONSUMPTION: 'fusion-consumption',
  FUSION_EFFICIENCY: 'fusion-efficiency',
  ANTIMATTER_ENGINE: 'antimatter-engine',
  ANTIMATTER_AUTOMATION: 'antimatter-automation',
  ANTIMATTER_MASS: 'antimatter-mass',
  ANTIMATTER_CONSUMPTION: 'antimatter-consumption',
  ANTIMATTER_EFFICIENCY: 'antimatter-efficiency',
};

const Tasks = {
  [TaskIds.FUEL_CAPTURE]: {
    title: 'Fuel Capture',
    description: 'Develop system to capture trace gases to use as fuel.',
    progress: ZERO,
    time: BigNumber(100),
    complete: function () {
      progression.unlock({ [TaskIds.FUEL_CAPTURE]: true });
      //   research.createTask(TaskIds.FUEL_CAPTURE_MASS);
    },
  },
  [TaskIds.FUEL_CAPTURE_MASS]: {
    title: 'Fuel Capture Mass',
    description: 'Reduce material need to expand the fuel capture net.',
    progress: ZERO,
    time: BigNumber(30),
    complete: function () {
      // TODO upgrade capture
      // rocket.upgradeEngines(Engines.COMBUSTION, {
      //     mass: initialRocket.engines[Engines.COMBUSTION].mass * Math.pow(0.85, this.iteration),
      //   });
      research.createTask(TaskIds.FUEL_CAPTURE_MASS, this.iteration + 1);
    },
  },
  // COMBUSTION
  [TaskIds.COMBUSTION_MASS]: {
    title: 'Combustion Engine Mass',
    description: 'Reduce material needed to build combustion engines.',
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
    description: 'Generate thrust with the power of fusion.',
    progress: ZERO,
    time: BigNumber(600),
    complete: function () {
      progression.unlock({ [Engines.FUSION]: true });
    },
  },
  // ANTIMATTER
  [TaskIds.ANTIMATTER_ENGINE]: {
    title: 'Antimatter Engine',
    description: 'Generate thrust with the power of antimatter annihilation.',
    progress: ZERO,
    time: BigNumber(100000),
    complete: function () {
      progression.unlock({ [Engines.ANTIMATTER]: true });
    },
  },
};

const initialAvailable = [
  TaskIds.FUEL_CAPTURE,
  TaskIds.COMBUSTION_MASS,
  TaskIds.COMBUSTION_CONSUMPTION,
  TaskIds.COMBUSTION_EFFICIENCY,
  TaskIds.FUSION_ENGINE,
  TaskIds.ANTIMATTER_ENGINE,
];

const initial = {
  available: {},
  active: {},
  completed: {},
};

const createResearch = () => {
  const store = writable(initial);
  const { subscribe, set, update } = store;

  const createTask = (taskBaseId, iteration) => {
    const { available, active } = get(store);
    // build task
    const task = clone(Tasks[taskBaseId]);
    task.iteration = iteration ?? 1;
    if (task.iteration > 1) task.title = `${task.title} ${task.iteration}`;
    task.time = task.time.times(Math.pow(1.1, task.iteration - 1));
    // make task available
    //   const taskId = `${taskBaseId}-${task.iteration}`;
    const taskId = taskBaseId;
    if (iteration !== undefined && true /**research auto */) active[taskId] = task;
    available[taskId] = task;
    update((data) => data);
  };

  return {
    subscribe,
    set,
    update: (updated) => update((current) => ({ ...current, ...updated })),
    reset: () => set(initial),
    createTask,
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
    initialize: () => {
      initialAvailable.forEach((taskId) => createTask(taskId));
    },
  };
};

export const research = createResearch();
