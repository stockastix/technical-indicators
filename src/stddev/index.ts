/**
 * standard deviation
 * @param data
 * @param n
 */
export default function* stddev(data: Float64Array, n: number) {
  let i = 0;
  let ma = 0;

  const len = data.length;
  const lastNValues = new Array(n);

  if (len < n)
    throw new RangeError('Specified period is too big for computing stddev');

  while (i < n) {
    ma += lastNValues[i] = data[i];
    i += 1;
  }

  // code coverage will be confused here - https://github.com/kulshekhar/ts-jest/issues/332
  /* istanbul ignore next */ // does not work
  // while (true) {
  for (;;) {
    let sum = 0;
    for (let j = 0; j < n; j += 1) sum += (lastNValues[j] - ma / n) ** 2;
    yield (sum / n) ** 0.5; // alt. (n-1)
    if (i >= len) break;
    ma += data[i] - lastNValues.shift();
    lastNValues.push(data[i]);
    i += 1;
  }
}
