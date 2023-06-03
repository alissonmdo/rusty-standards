export function isPromise<T>(value: Promise<T> | T): value is Promise<T> {
  return (
    value instanceof Promise ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (typeof (value as any)?.then === "function" &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof (value as any)?.catch === "function")
  );
}
