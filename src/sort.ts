import type { NonEmptyArray } from "./non-empty";
import type { Primitive } from "./primitive";

export enum OrderBy {
  ASC = "ASC",
  DESC = "DESC",
}

export type SortBy<T> = [keyof T, OrderBy];

export function Sort(dir: OrderBy): (a: Primitive, b: Primitive) => number;
export function Sort<T>(
  ...sorters: NonEmptyArray<SortBy<T>>
): (a: T, b: T) => number;
export function Sort<T>(
  ...param: NonEmptyArray<SortBy<T> | OrderBy>
): (a: T, b: T) => number {
  return function (a: T, b: T) {
    if (typeof param[0] === "string") {
      if (a < b) {
        return param[0] === OrderBy.ASC ? -1 : 1;
      }
      if (a > b) {
        return param[0] === OrderBy.ASC ? 1 : -1;
      }
      return 0;
    }
    for (const sorter of param as NonEmptyArray<SortBy<T>>) {
      const [key, dir] = sorter;
      if (a[key] < b[key]) {
        return dir === OrderBy.ASC ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return dir === OrderBy.ASC ? 1 : -1;
      }
    }
    return 0;
  };
}
