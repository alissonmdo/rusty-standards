export type Option<T> = Some<T> | None;

type BaseOption = {
  readonly _isOfTypeOption: true;
};

export interface Some<T> extends BaseOption {
  readonly kind: "Some";
  readonly value: T;
}

export interface None extends BaseOption {
  readonly kind: "None";
  readonly value: never;
}

export function Some<T>(value: T): Some<T> {
  return {
    kind: "Some",
    value,
    _isOfTypeOption: true,
  };
}

export function None(): None {
  return {
    kind: "None",
    _isOfTypeOption: true,
    value: undefined as never,
  };
}

export function IsSome<T>(option: Option<T>): option is Some<T> {
  return option.kind === "Some";
}

export function IsNone<T>(option: Option<T>): option is None {
  return option.kind === "None";
}
