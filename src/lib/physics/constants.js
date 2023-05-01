import BigNumber from 'bignumber.js';

export const SECOND = BigNumber(1);
export const MINUTE = BigNumber(60);
export const HOUR = BigNumber(3600);
export const DAY = BigNumber(86400);
export const YEAR = BigNumber(31558149.5); // Sidereal year

export const TIME_UNIT = SECOND;

export const DECIMAL_PLACES = 100;
BigNumber.config({ DECIMAL_PLACES, ROUNDING_MODE: BigNumber.ROUND_FLOOR });

export const INTEGRATION_THRESHOLD = 1;
export const MAX_INTEGRATION_STEPS = 100000;

export const ZERO = BigNumber(0);
export const ONE = BigNumber(1);
export const C = BigNumber(299792458);
export const CSQ = C.pow(2);
