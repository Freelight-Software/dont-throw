import { describe, expect, test } from 'vitest';
import { dontThrowAsync, ok, ResultAsync } from '@/index';
import { sleep } from './testUtil';

const throwAsync = async (value: string) => {
  await sleep(10);
  throw value;
};

describe('dontThrowAsync()', () => {
  test('Stops function from throwing & passes arguments', async () => {
    const safeResult = await dontThrowAsync(throwAsync)('potato');

    expect(safeResult.isOk()).toBeFalsy();
    expect(safeResult.isErr()).toBeTruthy();
    // @ts-expect-error
    expect(safeResult.error).toBe('potato');
  });

  test('Function which doesnt throw still runs', async () => {
    let run = false;

    const doesntThrow = async () => {
      run = true;
    };

    const safeResult = await dontThrowAsync(doesntThrow)();

    expect(safeResult.isOk()).toBeTruthy();
    expect(safeResult.isErr()).toBeFalsy();
    expect(run).toBeTruthy();
  });

  test('Function which doesnt throw still runs with parameters', async () => {
    let name = 'poop';
    let cat = 'tree';

    const doesntThrow = async (n: string, c: string) => {
      name = n;
      cat = c;
    };

    const safeResult = await dontThrowAsync(doesntThrow)('name', 'cat');

    expect(safeResult.isOk()).toBeTruthy();
    expect(safeResult.isErr()).toBeFalsy();
    expect(name).toStrictEqual('name');
    expect(cat).toStrictEqual('cat');
  });

  test('Function which doesnt throw unwraps correct value.', async () => {
    const doesntThrow = async () => {
      return -1;
    };

    const safeResult = await dontThrowAsync(doesntThrow)();

    expect(safeResult.isOk()).toBeTruthy();
    expect(safeResult.isErr()).toBeFalsy();

    if (safeResult.isOk()) {
      const value = safeResult.unwrap();

      expect(value).toBe(-1);
    }
  });
});

describe('ResultAsync', () => {
  describe('andThen()', () => {
    test('Calls next function successfully', async () => {
      const promise = () => sleep(10);

      let run = false;

      const result = await ResultAsync.fromPromise(promise()).andThen(() => {
        run = true;
        return ok(1);
      });

      expect(run).toBeTruthy();
      expect(result.isOk).toBeTruthy();
      expect(result.unwrap()).toBe(1);
    });

    test('Skips next function if thrown', async () => {
      const promise = async () => {
        await sleep(1);
        throw new Error('WOW');
      };

      let run = false;

      const result = await ResultAsync.fromPromise(promise()).andThen(() => {
        run = false;
        return ok(1);
      });

      expect(result.isErr()).toBeTruthy();
      expect(run).toBeFalsy();
    });
  });
});
