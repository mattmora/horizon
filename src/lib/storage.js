import { get } from 'svelte/store';
import { ONE, ZERO } from './physics/constants';
import { earthTime, horizonTime, lastUpdate, lorentz, multitaskFactor } from './physics/physics';
import { initialProgression, progression } from './stores/progression';
import { initialResearch, research } from './stores/research';
import { initialRocket, rocket } from './stores/rocket';
import BigNumber from 'bignumber.js';
import clone from 'just-clone';

const defaultState = {
  lorentz: ONE,
  earthTime: ZERO,
  horizonTime: ZERO,
  multitaskFactor: 1,
  progression: initialProgression,
  research: initialResearch,
  rocket: initialRocket,
  lastUpdate: 0,
};

// https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
const isNumericString = (str) => {
  if (typeof str != 'string') return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

export const saveState = () => {
  const data = {
    lorentz: get(lorentz),
    earthTime: get(earthTime),
    horizonTime: get(horizonTime),
    multitaskFactor: get(multitaskFactor),
    progression: get(progression),
    research: get(research),
    rocket: get(rocket),
    lastUpdate: get(lastUpdate),
  };

  localStorage.setItem('data', JSON.stringify(data));
};

export const loadState = () => {
  try {
    const data = JSON.parse(localStorage.getItem('data'), (key, val) => {
      return isNumericString(val) ? BigNumber(val) : val;
    });
    const load = {
      ...clone(defaultState),
      ...data,
    };

    console.log('LOAD:');
    console.log(load);

    lastUpdate.set(load.lastUpdate);
    lorentz.set(load.lorentz);
    earthTime.set(load.earthTime);
    horizonTime.set(load.horizonTime);
    multitaskFactor.set(load.multitaskFactor);

    progression.set(load.progression);
    research.set(load.research);
    rocket.set(load.rocket);
  } catch (err) {
    console.log(`load failed: ${err}`);
  }
};
