import { get, writable } from 'svelte/store';
import { progression } from './progression';
import { Engines, initialRocket, rocket } from './rocket';
import BigNumber from 'bignumber.js';
import { ZERO } from '../physics/constants';
import clone from 'just-clone';

export const TaskIds = {
  DATA_COLLECTION: 'data-collection',
  RESEARCH_AUTOMATION: 'research-automation',

  FUEL_CAPTURE: 'fuel-capture',
  FUEL_CAPTURE_AUTOMATION: 'fuel-capture-automation',
  FUEL_CAPTURE_MASS: 'fuel-capture-mass',

  MATERIAL_CAPTURE: 'material-capture',
  MATERIAL_CAPTURE_AUTOMATION: 'material-capture-automation',
  FUEL_MATERIAL_CONVERSION: 'fuel-material-conversion',

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

const defineTask = (title, description, time, complete) => ({
  title,
  description,
  progress: ZERO,
  time: BigNumber(time),
  complete,
});

export const Tasks = {
  // RESEARCH
  [TaskIds.DATA_COLLECTION]: defineTask('Data Collection', 'Gather observational data as Horizon travels to inform future research.', 200, (t) => {
    progression.unlock({ [TaskIds.DATA_COLLECTION]: true });
  }),
  [TaskIds.RESEARCH_AUTOMATION]: defineTask('Research Automation', 'Automatically continue research on incremental tasks.', 200, (t) => {
    progression.unlock({ [TaskIds.RESEARCH_AUTOMATION]: true });
  }),

  // FUEL
  [TaskIds.FUEL_CAPTURE]: defineTask('Fuel Capture', 'Develop system to capture trace gases to use as fuel.', 100, (t) => {
    progression.unlock({ [TaskIds.FUEL_CAPTURE]: true });
    research.createTask(TaskIds.FUEL_CAPTURE_AUTOMATION);
    research.createTask(TaskIds.FUEL_CAPTURE_MASS);
  }),
  [TaskIds.FUEL_CAPTURE_AUTOMATION]: defineTask('Fuel Capture Automation', 'Automatically expand or reduce the fuel capture net.', 100, (t) => {
    progression.unlock({ [TaskIds.FUEL_CAPTURE_AUTOMATION]: true });
  }),
  [TaskIds.FUEL_CAPTURE_MASS]: defineTask('Fuel Capture Mass', 'Reduce material need to expand the fuel capture net.', 30, (t) => {
    // TODO upgrade capture
    rocket.upgradeCapture({
      mass: initialRocket.capture.mass * Math.pow(0.85, t.iteration),
    });
    research.createTask(TaskIds.FUEL_CAPTURE_MASS, t.iteration + 1);
  }),

  // COMBUSTION
  [TaskIds.COMBUSTION_AUTOMATION]: defineTask('Combustion Engine Automation', 'Automatically build or recycle combustion engines.', 100, (t) => {
    progression.unlock({ [TaskIds.COMBUSTION_AUTOMATION]: true });
  }),
  [TaskIds.COMBUSTION_MASS]: defineTask('Combustion Engine Mass', 'Reduce material needed to build combustion engines.', 20, (t) => {
    rocket.upgradeEngines(Engines.COMBUSTION, {
      mass: initialRocket.engines[Engines.COMBUSTION].mass * Math.pow(0.85, t.iteration),
    });
    research.createTask(TaskIds.COMBUSTION_MASS, t.iteration + 1);
  }),
  [TaskIds.COMBUSTION_CONSUMPTION]: defineTask('Combustion Engine Consumption', 'Increase fuel consumption rate of combustion engines.', 20, (t) => {
    rocket.upgradeEngines(Engines.COMBUSTION, {
      consumption: initialRocket.engines[Engines.COMBUSTION].consumption.plus(t.iteration * 30),
    });
    research.createTask(TaskIds.COMBUSTION_CONSUMPTION, t.iteration + 1);
  }),
  [TaskIds.COMBUSTION_EFFICIENCY]: defineTask('Combustion Engine Efficiency', 'Improve combustion engine efficiency as throttle increases.', 20, (t) => {
    rocket.upgradeEngines(Engines.COMBUSTION, {
      loss: initialRocket.engines[Engines.COMBUSTION].loss * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds.COMBUSTION_EFFICIENCY, t.iteration + 1);
  }),

  // FUSION
  [TaskIds.FUSION_ENGINE]: defineTask('Fusion Engine', 'Generate thrust with the power of fusion.', 600, (t) => {
    progression.unlock({ [Engines.FUSION]: true });
    research.createTask(TaskIds.FUSION_MASS);
    research.createTask(TaskIds.FUSION_EFFICIENCY);
    research.createTask(TaskIds.FUSION_CONSUMPTION);
    research.createTask(TaskIds.FUSION_AUTOMATION);
  }),
  [TaskIds.FUSION_AUTOMATION]: defineTask('Fusion Engine Automation', 'Automatically build or recycle fusion engines.', 100, (t) => {
    progression.unlock({ [TaskIds.FUSION_AUTOMATION]: true });
  }),
  [TaskIds.FUSION_MASS]: defineTask('Fusion Engine Mass', 'Reduce material needed to build fusion engines.', 20, (t) => {
    rocket.upgradeEngines(Engines.FUSION, {
      mass: initialRocket.engines[Engines.FUSION].mass * Math.pow(0.85, t.iteration),
    });
    research.createTask(TaskIds.FUSION_MASS, t.iteration + 1);
  }),
  [TaskIds.FUSION_CONSUMPTION]: defineTask('Fusion Engine Consumption', 'Increase fuel consumption rate of fusion engines.', 20, (t) => {
    rocket.upgradeEngines(Engines.FUSION, {
      consumption: initialRocket.engines[Engines.FUSION].consumption.plus(t.iteration * 30),
    });
    research.createTask(TaskIds.FUSION_CONSUMPTION, t.iteration + 1);
  }),
  [TaskIds.FUSION_EFFICIENCY]: defineTask('Fusion Engine Efficiency', 'Improve fusion engine efficiency as throttle increases.', 20, (t) => {
    rocket.upgradeEngines(Engines.FUSION, {
      loss: initialRocket.engines[Engines.FUSION].loss * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds.FUSION_EFFICIENCY, t.iteration + 1);
  }),

  // ANTIMATTER
  [TaskIds.ANTIMATTER_ENGINE]: defineTask('Antimatter Engine', 'Generate thrust with the power of antimatter annihilation.', 100000, (t) => {
    progression.unlock({ [Engines.ANTIMATTER]: true });
    research.createTask(TaskIds.ANTIMATTER_MASS);
    research.createTask(TaskIds.ANTIMATTER_EFFICIENCY);
    research.createTask(TaskIds.ANTIMATTER_CONSUMPTION);
    research.createTask(TaskIds.ANTIMATTER_AUTOMATION);
  }),
  [TaskIds.ANTIMATTER_AUTOMATION]: defineTask('Antimatter Engine Automation', 'Automatically build or recycle antimatter engines.', 100, (t) => {
    progression.unlock({ [TaskIds.ANTIMATTER_AUTOMATION]: true });
  }),
  [TaskIds.ANTIMATTER_MASS]: defineTask('Antimatter Engine Mass', 'Reduce material needed to build antimatter engines.', 20, (t) => {
    rocket.upgradeEngines(Engines.ANTIMATTER, {
      mass: initialRocket.engines[Engines.ANTIMATTER].mass * Math.pow(0.85, t.iteration),
    });
    research.createTask(TaskIds.ANTIMATTER_MASS, t.iteration + 1);
  }),
  [TaskIds.ANTIMATTER_CONSUMPTION]: defineTask('Antimatter Engine Consumption', 'Increase fuel consumption rate of antimatter engines.', 20, (t) => {
    rocket.upgradeEngines(Engines.ANTIMATTER, {
      consumption: initialRocket.engines[Engines.ANTIMATTER].consumption.plus(t.iteration * 30),
    });
    research.createTask(TaskIds.ANTIMATTER_CONSUMPTION, t.iteration + 1);
  }),
  [TaskIds.ANTIMATTER_EFFICIENCY]: defineTask('Antimatter Engine Efficiency', 'Improve antimatter engine efficiency as throttle increases.', 20, (t) => {
    rocket.upgradeEngines(Engines.ANTIMATTER, {
      loss: initialRocket.engines[Engines.ANTIMATTER].loss * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds.ANTIMATTER_EFFICIENCY, t.iteration + 1);
  }),
};

const initialAvailable = [
  TaskIds.FUEL_CAPTURE,
  TaskIds.FUSION_ENGINE,
  TaskIds.COMBUSTION_MASS,
  TaskIds.COMBUSTION_EFFICIENCY,
  TaskIds.COMBUSTION_CONSUMPTION,
  TaskIds.COMBUSTION_AUTOMATION,
];

export const initialResearch = {
  available: {},
  active: {},
  completed: {},
};

const createResearch = () => {
  const store = writable(clone(initialResearch));
  const { subscribe, set, update } = store;

  const createTask = (taskBaseId, iteration) => {
    const { available, active } = get(store);
    // build task
    const task = clone(Tasks[taskBaseId]);
    // the complete function is effectively static, so delete it on the instance and only access via Tasks object
    delete task.complete;
    task.iteration = iteration ?? 1;
    if (task.iteration > 1) task.title = `${task.title} ${task.iteration}`;
    task.time = task.time.times(Math.pow(1.1, task.iteration - 1));
    // make task available
    //   const taskId = `${taskBaseId}-${task.iteration}`;
    const taskId = taskBaseId;
    if (iteration !== undefined && get(progression).unlocks[TaskIds.RESEARCH_AUTOMATION]) active[taskId] = task;
    available[taskId] = task;
    update((data) => data);
  };

  return {
    subscribe,
    set,
    update: (updated) => update((current) => ({ ...current, ...updated })),
    reset: () => set(clone(initialResearch)),
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
