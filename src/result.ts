/**
 * Result monad
 * @example
 * const [value, err] = await someAyncResult();
 * if (err !== null) {
 *  // handle error
 * }
 * // use value
 */
export type Result<T> = ([T, null] | [null, ResultError]) & {
  _isOfTypeResult: true;
};

export function IsResult<T>(result: unknown): result is Result<T> {
  return (
    (result as Result<T>)?._isOfTypeResult === true &&
    Array.isArray(result) &&
    result.length === 2
  );
}

export type StacKInfo = {
  data: unknown;
  message?: string;
  at: string;
};
export class ResultError extends Error {
  public info: StacKInfo[] = [];
  constructor(message: string) {
    super(message);
  }

  public addInfo(info: StacKInfo): void {
    this.info.push(info);
  }
}

export function Ok<T>(value: T): Result<T> {
  const result = [value, null] as Result<T>;
  Object.defineProperty(result, "_isOfTypeResult", {
    value: true,
    writable: false,
  });
  return result;
}

export function Err<T>(
  errorParam: Error | ResultError | string,
  info?: Omit<StacKInfo, "at">
): Result<T> {
  let error: ResultError;
  if (errorParam instanceof ResultError) {
    error = errorParam;
  } else if (errorParam instanceof Error) {
    error = new ResultError(errorParam.message);
    error.stack = errorParam.stack;
  } else {
    error = new ResultError(errorParam);
  }
  const stack = new Error().stack;
  // get the second item in the stack
  const at = stack?.split("\n")[2].trim() ?? "unknown";
  if (info !== undefined) error.addInfo({ ...info, at });

  const result = [null, error] as Result<T>;

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
        (value) => (IsResult(value) ? value : Ok(value)),
        (err) => Err(err as Error)
      );
    }
    const value = (unsafe as () => T)();
    if (IsResult(value)) return value;
    return Ok(value);
  } catch (err) {
    return Err(err as Error);
  }
}
