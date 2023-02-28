export type NonEmptyArray<T> = [T, ...T[]];

export type NonEmptyString = string & { _isNonEmptyString: true };

export function isNonEmptyString(value: string): value is NonEmptyString {
  return value.length > 0;
}
