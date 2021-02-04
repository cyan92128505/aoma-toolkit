import { jest } from '@jest/globals';
import { fillZero } from './fillZero';

describe('fillZero()', () => {
  it('fill 55 from 295 to 055', () => {
    expect(fillZero(55, 295)).toEqual('055');
  });
});
