import { isPromise } from "./is-promise";

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
  __RUSTY_STANDARDS_RESULT: true;
};

export function isResult<T>(result: Result<T> | unknown): result is Result<T> {
  return (result as Result<T>)?.__RUSTY_STANDARDS_RESULT === true;
}

export class ResultError {
  private __RUSTY_STANDARDS_RESULT_ERROR = true;
  public originalError?: Error;
  public stack?: string;
  public message: string;
  constructor(message: string, originalError?: Error) {
    this.message = message;
    this.originalError = originalError;
    let stack = new Error().stack;
    // remove last 2 stack frames
    stack = stack?.split("\n").slice(3).join("\n");
    this.stack = "ResultError: " + message + "\n" + stack;
  }
}
export function Ok<T>(value: T): Result<T> {
  const result = [value, null] as Result<T>;
  Object.defineProperty(result, "__RUSTY_STANDARDS_RESULT", {
    value: true,
    writable: false,
  });
  return result;
}

export function Err<T>(error: ResultError): Result<T>;
export function Err<T>(message: string, originalError?: Error): Result<T>;
export function Err<T>(
  errorOrMessage: ResultError | string,
  originalError?: Error
): Result<T> {
  const error =
    typeof errorOrMessage === "string"
      ? new ResultError(errorOrMessage, originalError)
      : errorOrMessage;

  const result = [null, error] as Result<T>;

  Object.defineProperty(result, "__RUSTY_STANDARDS_RESULT", {
    value: true,
    writable: false,
  });

  return result;
}

export function safe<T>(parameters: {
  onErrorMessage: string;
  unsafe: Promise<Result<T>>;
}): Promise<Result<T>>;
export function safe<T>(parameters: {
  onErrorMessage: string;
  unsafe: Promise<T>;
}): Promise<Result<T>>;
export function safe<T>(parameters: {
  onErrorMessage: string;
  unsafe: () => Result<T>;
}): Result<T>;
export function safe<T>(parameters: {
  onErrorMessage: string;
  unsafe: () => T;
}): Result<T>;
export function safe<
  T =
    | Promise<Result<unknown>>
    | Promise<unknown>
    | (() => Result<unknown>)
    | (() => unknown)
>(parameters: {
  onErrorMessage: string;
  unsafe: T;
}): Promise<Result<unknown>> | Result<unknown> {
  const { onErrorMessage, unsafe } = parameters;
  try {
    if (unsafe === undefined) return Err("toResult called with undefined");
    if (unsafe === null) return Err("toResult called with null");

    if (isPromise(unsafe)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (unsafe as any).then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (value: any) => (isResult(value) ? value : Ok(value)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => Err(onErrorMessage, error)
      );
    }
    const value = (unsafe as () => T)();
    if (isResult(value)) {
      return value;
    }
    return Ok(value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Err(onErrorMessage, error);
  }
}

export function resultToError(resultError: ResultError): Error {
  const error = new Error(resultError.message);
  error.stack = resultError.stack;
  return error;
}
