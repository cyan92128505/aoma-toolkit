/**
 * @param  {Number} index
 * @param  {Number} length
 */
export function fillZero(index, length) {
  return `${Math.pow(10, `${length}`.length) + index}`.substring(1);
}
