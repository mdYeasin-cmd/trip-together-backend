import { Condition } from "@prisma/orm-postgres/orm-client";
import type {
  ModelCreateInput,
  ModelRow,
  ModelUpdateInput,
} from "../../interfaces/model";

export interface ITrip extends ModelRow<"Trip"> {}

export interface ITripUpdateData extends ModelUpdateInput<"Trip"> {}

export interface ITripCreateData extends ModelCreateInput<"Trip"> {}

export type TripCondition = (trip: any) => Condition;
