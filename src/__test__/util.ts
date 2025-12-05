import assert from 'node:assert';
import path from 'node:path';
import { describe, it } from 'node:test';

type testargs = {
  // e.g. "sma" // (input: Float64Array, param: number) => Generator<number, void, unknown>;
  fn: string;
  // e.g. "simple moving average"
  // will default to value of fn if not provided
  desc?: string;
  // e.g. [10,11,12,13]
  input: number[];
  // e.g. period = 3
  param: number;
  // the expected result of the computation by the indicator
  // falsy if computation is expected to fail (throw)
  output?: number[] | false;
};

export default function test({ fn, desc, input, param, output }: testargs) {
  describe(`${fn}(...)`, () => {
    it(`should ${!output ? `throw${desc ? ' in case of' : ''}` : 'yield'} ${
      desc || fn
    }`, async () => {
      const { default: fct } = await import(path.join('../', fn, '/index.ts'));
      const generator = fct(new Float64Array(input), ...[param].flat());

      if (!output) assert.throws(generator.next);
      else {
        while (output.length) {
          // check values to be close (may not be strictly equal
          // due to computer precision)
          const value = generator.next().value;
          assert.ok(Math.abs((value - output.shift()!) / value) < 10 ** -3);
        }
        assert.ok(generator.next().done);
      }
    });
  });
}
