import type {
  CollectionRowOf,
  CreateInput,
} from "@prisma/orm-postgres/orm-client";
import type { Contract, FieldInputTypes } from "../../prisma/contract.d";
import type { orm } from "../../prisma/db";

type Orm = typeof orm;

/** Removes `readonly` that the generated contract puts on every field */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** All model names in the `public` namespace — derived from the generated contract */
export type ModelName = keyof FieldInputTypes["public"] & keyof Orm & string;

/** Row returned by orm.<Model>.create / first / all (scalar columns) */
export type ModelRow<M extends ModelName> = CollectionRowOf<Orm[M]>;

/** All writable scalar fields of a model (every column required) */
export type ModelInput<M extends ModelName> = Mutable<
  FieldInputTypes["public"][M]
>;

/** Payload accepted by orm.<Model>.create — defaulted columns are optional */
export type ModelCreateInput<M extends ModelName> = Mutable<
  CreateInput<Contract, M, "public">
>;

/** Partial input for updates */
export type ModelUpdateInput<M extends ModelName> = Partial<ModelInput<M>>;
