import BigNumber from 'bignumber.js';

export const DECIMAL_PLACES = 100;
BigNumber.config({ DECIMAL_PLACES });

export const ZERO = new BigNumber(0);
export const ONE = new BigNumber(1);
export const C = new BigNumber(299792458);
export const CSQ = C.pow(2);
