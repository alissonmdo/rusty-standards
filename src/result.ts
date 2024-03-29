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
export type Result<T> = ([ResultError, null] | [null, T]) & {
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
  const result = [null, value] as Result<T>;
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

  const result = [error, null] as Result<T>;

  Object.defineProperty(result, "__RUSTY_STANDARDS_RESULT", {
    value: true,
    writable: false,
  });

  return result;
}

export function safe<T>(
  actionName: string,
  unsafe: () => Promise<Result<T>>
): Promise<Result<T>>;
export function safe<T>(
  actionName: string,
  unsafe: () => Promise<T>
): Promise<Result<T>>;
export function safe<T>(actionName: string, unsafe: () => Result<T>): Result<T>;
export function safe<T>(actionName: string, unsafe: () => T): Result<T>;
export function safe<
  T =
    | (() => Promise<Result<unknown>>)
    | (() => Promise<unknown>)
    | (() => Result<unknown>)
    | (() => unknown)
>(actionName: string, unsafe: T): Promise<Result<unknown>> | Result<unknown> {
  if (unsafe === undefined) return Err("toResult called with undefined");
  if (unsafe === null) return Err("toResult called with null");
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (unsafe as any)();
    if (isPromise(result)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (value: any) => (isResult(value) ? value : Ok(value)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => Err("Failed to " + actionName.trim(), error)
      );
    }
    if (isResult(result)) {
      return result;
    }
    return Ok(result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Err("Failed to " + actionName.trim(), error);
  }
}

export function resultToError(resultError: ResultError): Error {
  const error = new Error(resultError.message);
  error.stack = resultError.stack;
  return error;
}
