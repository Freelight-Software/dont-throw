# @freelight-software/dont-throw

A tiny TypeScript library for safe, result-based function returns that prevent exceptions from being thrown. Inspired by Rust's `Result` type, this library helps you handle errors without using try/catch.

## Installation

```sh
npm install @freelight-software/dont-throw
```

## Usage

### Wrapping Functions

Use `dontThrow` to wrap any function that might throw. Instead of throwing, it returns a `Result` object.

```typescript
import { dontThrow, ok, err, type Result } from '@freelight-software/dont-throw';

const mightThrow = (x: number) => {
  if (x < 0) throw 'Negative!';
  return x * 2;
};

const safeFn = dontThrow(mightThrow);

const result = safeFn(-1);

if (result.isOk()) {
  console.log('Value:', result.value);
} else {
  console.error('Error:', result.error);
}
```

### Creating Results Directly

```typescript
const success = ok(123);
const failure = err('Something went wrong');

if (success.isOk()) {
  // access success.value
}

if (failure.isErr()) {
  // access failure.error
}
```

### Unwrapping

- `result.unwrap()` returns the value if `Ok`, or throws the error if `Err`.

### Async Support

Use `dontThrowAsync` for async functions:

```typescript
import { dontThrowAsync } from '@freelight-software/dont-throw';

const asyncFn = async (x: number) => {
  if (x < 0) throw new Error('Negative!');
  return x * 2;
};

const safeAsync = dontThrowAsync(asyncFn);

const result = await safeAsync(1);
if (result.isOk()) {
  // result.value
}
```

## API

- `ok(value)` — Create a success result.
- `err(error)` — Create an error result.
- `dontThrow(fn)` — Wrap a sync function to return a `Result`.
- `dontThrowAsync(fn)` — Wrap an async function to return a `Promise<Result>`.
- `Result.isOk()` / `Result.isErr()`
- `Result.value` / `Result.error`
- `Result.unwrap()`
- `Result.map(fn)`
- `Result.andThen(fn)`

## License

ISC
