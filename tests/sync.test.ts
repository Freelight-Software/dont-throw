import { describe, expect, test } from 'vitest';
import { dontThrow, err, ok, type Result } from '@/index';

const throwSync = (value: string) => {
  throw value;
};

// TODO: Bind this tests

describe('dontThrow()', () => {
  test('Stops function from throwing & passes arguments', () => {
    const safeResult = dontThrow(throwSync)('HELLO');

    expect(safeResult.isOk()).toBeFalsy();
    expect(safeResult.isErr()).toBeTruthy();

    if (safeResult.isErr()) {
      const error = safeResult.error;

      expect(error).toBe('HELLO');
    }
  });

  test('Function which doesnt throw still runs', () => {
    let run = false;

    const doesntThrow = () => {
      run = true;
    };

    const safeResult = dontThrow(doesntThrow)();

    expect(safeResult.isOk()).toBeTruthy();
    expect(safeResult.isErr()).toBeFalsy();
    expect(run).toBeTruthy();
  });

  test('Function which doesnt throw still runs with parameters', () => {
    let name = 'poop';
    let cat = 'tree';

    const doesntThrow = (n: string, c: string) => {
      name = n;
      cat = c;
    };

    const safeResult = dontThrow(doesntThrow)('name', 'cat');

    expect(safeResult.isOk()).toBeTruthy();
    expect(safeResult.isErr()).toBeFalsy();
    expect(name).toStrictEqual('name');
    expect(cat).toStrictEqual('cat');
  });

  test('Function which doesnt throw unwraps correct value.', () => {
    const doesntThrow = () => {
      return -1;
    };

    const safeResult = dontThrow(doesntThrow)();

    expect(safeResult.isOk()).toBeTruthy();
    expect(safeResult.isErr()).toBeFalsy();

    if (safeResult.isOk()) {
      const value = safeResult.value;

      expect(value).toBe(-1);
    }
  });
});

describe('ok()', () => {
  test('Returns value when not thrown', () => {
    const potato = (): Result<string, never> => {
      return ok('Mate!');
    };

    const result = potato();

    expect(result.isOk()).toBeTruthy();
    expect(result.isErr()).toBeFalsy();
    expect(result.unwrap()).toBe('Mate!');
    // @ts-expect-error
    expect(result.value).toBe('Mate!');
  });

  test('Returns value object', () => {
    const value = 42;
    const result = ok(value);

    expect(result.isOk()).toBeTruthy();
    expect(result.isErr()).toBeFalsy();
    expect(result.value).toBe(value);
  });

  test('unwrap returns value', () => {
    const value = { foo: 'bar' };
    const result = ok(value);

    expect(result.unwrap()).toBe(value);
  });

  test('error property is not accessible', () => {
    const result = ok('test');
    // @ts-expect-error
    expect(result.error).toBeUndefined();
  });
});

describe('err()', () => {
  test('Returns error object', () => {
    const errorValue = 'Some error';
    const result = err(errorValue);

    expect(result.isOk()).toBeFalsy();
    expect(result.isErr()).toBeTruthy();
    expect(result.error).toBe(errorValue);
  });

  test('Throws error on unwrap', () => {
    const errorValue = 'Unwrap error';
    const result = err(errorValue);

    expect(() => result.unwrap()).toThrow(errorValue);
  });

  test('value property is undefined', () => {
    const result = err('error');
    // @ts-expect-error
    expect(result.value).toBeUndefined();
  });

  test('value property is undefined for object error', () => {
    const result = err({ foo: 'bar' });
    // @ts-expect-error
    expect(result.value).toBeUndefined();
  });
});
