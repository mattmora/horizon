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

  [Engines.COMBUSTION]: {
    AUTOMATION: 'combustion-automation',
    MASS: 'combustion-mass',
    CONSUMPTION: 'combustion-consumption',
    EFFICIENCY: 'combustion-efficiency',
  },

  [Engines.FUSION]: {
    ENGINE: 'fusion-engine',
    AUTOMATION: 'fusion-automation',
    MASS: 'fusion-mass',
    CONSUMPTION: 'fusion-consumption',
    EFFICIENCY: 'fusion-efficiency',
  },

  [Engines.ANTIMATTER]: {
    ENGINE: 'antimatter-engine',
    AUTOMATION: 'antimatter-automation',
    MASS: 'antimatter-mass',
    CONSUMPTION: 'antimatter-consumption',
    EFFICIENCY: 'antimatter-efficiency',
  },
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
  [TaskIds.FUEL_CAPTURE_AUTOMATION]: defineTask('Fuel Capture Automation', 'Automatically expand or reduce the fuel capture net.', 50, (t) => {
    progression.unlock({ [TaskIds.FUEL_CAPTURE_AUTOMATION]: true });
    rocket.upgradeCapture({
      automation: { ...get(rocket).capture.automation, interval: Math.pow(0.9, t.iteration) },
    });
    research.createTask(TaskIds.FUEL_CAPTURE_AUTOMATION, t.iteration + 1);
  }),
  [TaskIds.FUEL_CAPTURE_MASS]: defineTask('Fuel Capture Mass', 'Reduce material need to expand the fuel capture net.', 30, (t) => {
    rocket.upgradeCapture({
      mass: initialRocket.capture.mass * Math.pow(0.85, t.iteration),
    });
    research.createTask(TaskIds.FUEL_CAPTURE_MASS, t.iteration + 1);
  }),

  // COMBUSTION
  [TaskIds[Engines.COMBUSTION].AUTOMATION]: defineTask('Combustion Engine Automation', 'Automatically build or recycle combustion engines.', 50, (t) => {
    progression.unlock({ [TaskIds[Engines.COMBUSTION].AUTOMATION]: true });
    rocket.upgradeEngines(Engines.COMBUSTION, {
      automation: { ...get(rocket).engines[Engines.COMBUSTION].automation, interval: Math.pow(0.9, t.iteration) },
    });
    research.createTask(TaskIds[Engines.COMBUSTION].AUTOMATION, t.iteration + 1);
  }),
  [TaskIds[Engines.COMBUSTION].MASS]: defineTask('Combustion Engine Mass', 'Reduce material needed to build combustion engines.', 25, (t) => {
    rocket.upgradeEngines(Engines.COMBUSTION, {
      mass: initialRocket.engines[Engines.COMBUSTION].mass * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds[Engines.COMBUSTION].MASS, t.iteration + 1);
  }),
  [TaskIds[Engines.COMBUSTION].CONSUMPTION]: defineTask('Combustion Engine Consumption', 'Increase fuel consumption rate of combustion engines.', 25, (t) => {
    rocket.upgradeEngines(Engines.COMBUSTION, {
      consumption: initialRocket.engines[Engines.COMBUSTION].consumption.plus(t.iteration * 30),
    });
    research.createTask(TaskIds[Engines.COMBUSTION].CONSUMPTION, t.iteration + 1);
  }),
  [TaskIds[Engines.COMBUSTION].EFFICIENCY]: defineTask('Combustion Engine Efficiency', 'Improve combustion engine propulsion efficiency curve.', 25, (t) => {
    rocket.upgradeEngines(Engines.COMBUSTION, {
      loss: initialRocket.engines[Engines.COMBUSTION].loss * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds[Engines.COMBUSTION].EFFICIENCY, t.iteration + 1);
  }),

  // FUSION
  [TaskIds[Engines.FUSION].ENGINE]: defineTask('Fusion Engine', 'Generate thrust with the power of fusion.', 600, (t) => {
    progression.unlock({ [Engines.FUSION]: true });
    research.createTask(TaskIds[Engines.FUSION].MASS);
    research.createTask(TaskIds[Engines.FUSION].EFFICIENCY);
    research.createTask(TaskIds[Engines.FUSION].CONSUMPTION);
    research.createTask(TaskIds[Engines.FUSION].AUTOMATION);
  }),
  [TaskIds[Engines.FUSION].AUTOMATION]: defineTask('Fusion Engine Automation', 'Automatically build or recycle fusion engines.', 50, (t) => {
    progression.unlock({ [TaskIds[Engines.FUSION].AUTOMATION]: true });
    rocket.upgradeEngines(Engines.FUSION, {
      automation: { ...get(rocket).engines[Engines.FUSION].automation, interval: Math.pow(0.9, t.iteration) },
    });
    research.createTask(TaskIds[Engines.FUSION].AUTOMATION, t.iteration + 1);
  }),
  [TaskIds[Engines.FUSION].MASS]: defineTask('Fusion Engine Mass', 'Reduce material needed to build fusion engines.', 25, (t) => {
    rocket.upgradeEngines(Engines.FUSION, {
      mass: initialRocket.engines[Engines.FUSION].mass * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds[Engines.FUSION].MASS, t.iteration + 1);
  }),
  [TaskIds[Engines.FUSION].CONSUMPTION]: defineTask('Fusion Engine Consumption', 'Increase fuel consumption rate of fusion engines.', 25, (t) => {
    rocket.upgradeEngines(Engines.FUSION, {
      consumption: initialRocket.engines[Engines.FUSION].consumption.plus(t.iteration * 30),
    });
    research.createTask(TaskIds[Engines.FUSION].CONSUMPTION, t.iteration + 1);
  }),
  [TaskIds[Engines.FUSION].EFFICIENCY]: defineTask('Fusion Engine Efficiency', 'Improve fusion engine propulsion efficiency curve.', 25, (t) => {
    rocket.upgradeEngines(Engines.FUSION, {
      loss: initialRocket.engines[Engines.FUSION].loss * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds[Engines.FUSION].EFFICIENCY, t.iteration + 1);
  }),

  // ANTIMATTER
  [TaskIds[Engines.ANTIMATTER].ENGINE]: defineTask('Antimatter Engine', 'Generate thrust with the power of antimatter annihilation.', 100000, (t) => {
    progression.unlock({ [Engines.ANTIMATTER]: true });
    research.createTask(TaskIds[Engines.ANTIMATTER].MASS);
    research.createTask(TaskIds[Engines.ANTIMATTER].EFFICIENCY);
    research.createTask(TaskIds[Engines.ANTIMATTER].CONSUMPTION);
    research.createTask(TaskIds[Engines.ANTIMATTER].AUTOMATION);
  }),
  [TaskIds[Engines.ANTIMATTER].AUTOMATION]: defineTask('Antimatter Engine Automation', 'Automatically build or recycle antimatter engines.', 50, (t) => {
    progression.unlock({ [TaskIds[Engines.ANTIMATTER].AUTOMATION]: true });
    rocket.upgradeEngines(Engines.ANTIMATTER, {
      automation: { ...get(rocket).engines[Engines.ANTIMATTER].automation, interval: Math.pow(0.9, t.iteration) },
    });
    research.createTask(TaskIds[Engines.ANTIMATTER].AUTOMATION, t.iteration + 1);
  }),
  [TaskIds[Engines.ANTIMATTER].MASS]: defineTask('Antimatter Engine Mass', 'Reduce material needed to build antimatter engines.', 25, (t) => {
    rocket.upgradeEngines(Engines.ANTIMATTER, {
      mass: initialRocket.engines[Engines.ANTIMATTER].mass * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds[Engines.ANTIMATTER].MASS, t.iteration + 1);
  }),
  [TaskIds[Engines.ANTIMATTER].CONSUMPTION]: defineTask('Antimatter Engine Consumption', 'Increase fuel consumption rate of antimatter engines.', 25, (t) => {
    rocket.upgradeEngines(Engines.ANTIMATTER, {
      consumption: initialRocket.engines[Engines.ANTIMATTER].consumption.plus(t.iteration * 30),
    });
    research.createTask(TaskIds[Engines.ANTIMATTER].CONSUMPTION, t.iteration + 1);
  }),
  [TaskIds[Engines.ANTIMATTER].EFFICIENCY]: defineTask('Antimatter Engine Efficiency', 'Improve antimatter engine propulsion efficiency curve.', 25, (t) => {
    rocket.upgradeEngines(Engines.ANTIMATTER, {
      loss: initialRocket.engines[Engines.ANTIMATTER].loss * Math.pow(0.9, t.iteration),
    });
    research.createTask(TaskIds[Engines.ANTIMATTER].EFFICIENCY, t.iteration + 1);
  }),
};

const initialAvailable = [
  TaskIds.FUEL_CAPTURE,
  TaskIds[Engines.FUSION].ENGINE,
  TaskIds[Engines.COMBUSTION].MASS,
  TaskIds[Engines.COMBUSTION].EFFICIENCY,
  TaskIds[Engines.COMBUSTION].CONSUMPTION,
  TaskIds[Engines.COMBUSTION].AUTOMATION,
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
    task.time = task.time.times(Math.pow(1.15, task.iteration - 1));
    // make task available
    //   const taskId = `${taskBaseId}-${task.iteration}`;
    const taskId = taskBaseId;
    if (iteration !== undefined && get(progression).unlocks[TaskIds.RESEARCH_AUTOMATION]) active[taskId] = task;
    available[taskId] = task;
    update((data) => data);
  };

  let onComplete = () => {};
  const setCompleteCallback = (c) => {
    onComplete = c;
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
      const task = (completed[taskId] = available[taskId]);
      onComplete(task);
      delete available[taskId];
      delete active[taskId];
      update((data) => data);
    },
    initialize: () => {
      initialAvailable.forEach((taskId) => createTask(taskId));
    },
    setCompleteCallback,
  };
};

export const research = createResearch();
