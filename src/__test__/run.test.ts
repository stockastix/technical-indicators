/**
 * This is the entry point to run all tests
 */

// run through all .ts files under ./src,
// check for a matching .test.json test file
// and call the test.
// exit(1) if no test file found, hence enforcing a test file for each indicator

import fs from 'node:fs';
import path from 'node:path';

import unittest from './util.ts';

// recursive option requires node >18.17.0
(fs.readdirSync('./src', { recursive: true }) as string[])
  .filter((file) => path.dirname(file) !== '__test__')
  .filter((file) => path.extname(file) === '.ts')
  .filter((file) => file !== 'index.ts')
  .forEach((file) => {
    const fn = path.dirname(file);

    try {
      // if there is no matching test file, this will throw,
      // and this is expected.
      const fileData = fs.readFileSync(
        path.join(`./src/${fn}`, `${fn}.test.json`)
      );

      // The json test file is expected to provide 1 or more (i.e. an array of) tests
      Array.from(JSON.parse(fileData.toString())).forEach((value) => {
        // @ts-ignore Property '...' does not exist on type '{}'
        const { desc, input, param, output = false } = value;

        // check the json test file provides the expected info
        // desc and output are actually optional. input and param are mandatory
        if (!Array.isArray(input) || Number.isNaN(param))
          throw new SyntaxError();

        // all looks good. Run actual test!
        unittest({ fn, desc, input, param, output });
      });
    } catch (err) {
      // from typescript 4.4(?) err is considered of type unknown by default in catch
      // This leads to typescript complaining about err.code, so I cast err
      // However this leads to another issue that NodeJS is not defined.
      // Solved by https://github.com/Chatie/eslint-config/issues/45#issuecomment-885507652
      // (@TODO: this seems a temporary solution though)
      if ((err as NodeJS.ErrnoException).code === 'ENOENT')
        console.error(`Missing file ${fn}.test.json in ./src/${fn}/.`);
      else if (err instanceof SyntaxError)
        console.error(`Syntax error in ${fn}.test.json`);

      // non-0 exit in case this is used in a CI pipeline
      // (e.g. want github action to fail)
      process.exit(1);
    }
  });
