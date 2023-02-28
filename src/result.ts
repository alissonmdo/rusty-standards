/**
 * Result monad
 * @example
 * const [value, err] = await someAyncResult();
 * if (err !== null) {
 *  // handle error
 * }
 * // use value
 */
export type Result<T> = ([T, null] | [null, Error]) & {
  _isOfTypeResult: true;
};

export function IsResult<T>(result: unknown): result is Result<T> {
  return (
    (result as Result<T>)?._isOfTypeResult === true &&
    Array.isArray(result) &&
    result.length === 2
  );
}

export function Ok<T>(value: T): Result<T> {
  const result = [value, null] as Result<T>;
  Object.defineProperty(result, "_isOfTypeResult", {
    value: true,
    writable: false,
  });
  return result;
}

export function Err<T>(error: Error | string): Result<T> {
  const err = !(error instanceof Error) ? new Error(String(error)) : error;
  const result = [null, err] as Result<T>;
  Object.defineProperty(result, "_isOfTypeResult", {
    value: true,
    writable: false,
  });

  return result;
}

export function toResult<T>(unsafe: Promise<Result<T>>): Promise<Result<T>>;
export function toResult<T>(unsafe: Promise<T>): Promise<Result<T>>;
export function toResult<T>(unsafe: () => Result<T>): Result<T>;
export function toResult<T>(unsafe: () => T): Result<T>;
export function toResult<
  T =
    | Promise<Result<unknown>>
    | Promise<unknown>
    | (() => Result<unknown>)
    | (() => unknown)
>(unsafe: T): Promise<Result<unknown>> | Result<unknown> {
  try {
    if (unsafe instanceof Promise) {
      return unsafe.then(
        value => (IsResult(value) ? value : Ok(value)),
        err => Err(err as Error | string)
      );
    }
    const value = (unsafe as () => T)();
    if (IsResult(value)) return value;
    return Ok(value);
  } catch (err) {
    return Err(err as Error | string);
  }
}
