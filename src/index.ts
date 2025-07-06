// biome-ignore lint/suspicious/noExplicitAny: can be anything
type Func = (...args: readonly any[]) => any;

export type Result<T, E> = Ok<T, E> | Err<T, E>;
export type AsyncResult<T, E> = Promise<Result<T, E>>;

export interface IResult<T, E> {
  isOk(): this is Ok<T, E>;
  isErr(): this is Err<T, E>;
  andThen<R, F>(func: (result: T) => Result<R, F>): Result<R, E | F>;
  unwrap(): T;
  map<R>(func: (result: T) => R): Result<R, E>;
}
export function ok<T, E = never>(value: T): Ok<T, E>;
export function ok<T extends undefined = undefined, E = never>(
  value: T,
): Ok<T, E> {
  return new Ok(value);
}

export function err<T = never, E extends string = string>(err: E): Err<T, E>;
export function err<T = never, E = unknown>(err: E): Err<T, E>;
// biome-ignore lint/suspicious/noConfusingVoidType: is the return of a function
export function err<T = never, E extends void = void>(err: E): Err<T, void>;
export function err<T = never, E = unknown>(err: E): Err<T, E>;
export function err<T = never, E extends Error = Error>(err: E): Err<T, E> {
  return new Err(err);
}

export function dontThrow<T extends Func, E>(
  func: T,
  bindThis?: unknown,
): (...args: Parameters<T>) => Result<ReturnType<T>, E> {
  return (...args) => {
    let finalFunc = func;

    if (bindThis) {
      //@ts-expect-error bad typing
      finalFunc = func.bind(bindThis);
    }
    try {
      const result = finalFunc(...args);
      return ok(result);
    } catch (e) {
      return err<never, E>(e as E);
    }
  };
}

// biome-ignore lint/suspicious/noExplicitAny: can be anything!
export function dontThrowAsync<Args extends readonly any[], ReturnValue, E>(
  func: (...args: Args) => Promise<ReturnValue>,
  bindThis?: unknown,
): (...args: Args) => AsyncResult<ReturnValue, E> {
  return async (...args) => {
    let finalFunc = func;

    if (bindThis) {
      finalFunc = func.bind(bindThis);
    }
    try {
      const result = await finalFunc(...args);
      return ok(result);
    } catch (e) {
      return err<never, E>(e as E);
    }
  };
}

export class Ok<T, E> implements IResult<T, E> {
  private val: T;

  constructor(value: T) {
    this.val = value;
  }

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return !this.isOk();
  }

  get value(): T {
    return this.val;
  }

  andThen<R, F>(func: (result: T) => Result<R, F>): Result<R, F> {
    return func(this.val);
  }

  unwrap(): T {
    return this.val;
  }

  map<R>(func: (result: T) => R): Result<R, E> {
    return ok(func(this.val));
  }
}

export class Err<T, E> implements IResult<T, E> {
  private err: E;

  constructor(err: E) {
    this.err = err;
  }

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<T, E> {
    return !this.isOk();
  }

  get error(): E {
    return this.err;
  }

  andThen<R, F>(_func: (result: T) => Result<R, F>): Result<R, E> {
    return err(this.err);
  }

  unwrap(): T {
    throw this.err;
  }

  map<R>(_func: (result: T) => R): Result<R, E> {
    return err(this.err);
  }
}

export class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
  private promise: Promise<Result<T, E>>;

  constructor(promise: Promise<Result<T, E>>) {
    this.promise = promise;
  }

  static fromPromise<T, E>(promise: Promise<T>): ResultAsync<T, E> {
    const resultPromise = promise
      .then((value: T) => new Ok<T, E>(value))
      .catch((e) => new Err<T, E>(e));

    return new ResultAsync(resultPromise);
  }

  // biome-ignore lint/suspicious/noThenProperty: have to implement PromiseLike
  then<A, B>(
    onfulfilled?: (value: Result<T, E>) => A | PromiseLike<A>,
    onrejected?: (reason: unknown) => B | PromiseLike<B>,
  ): PromiseLike<A | B> {
    return this.promise.then(onfulfilled, onrejected);
  }

  andThen<R, F>(
    func: (result: T) => Result<R, F> | Promise<Result<R, F>>,
  ): ResultAsync<R, E | F> {
    return new ResultAsync(
      this.promise.then(async (res) => {
        if (res.isErr()) {
          return err(res.error);
        }

        const result = await func(res.value);
        return result instanceof ResultAsync ? result.promise : result;
      }),
    );
  }
}
