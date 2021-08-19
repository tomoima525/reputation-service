import { Model, Document } from "mongoose";
import { findByGroupId } from "./Group.statics";

export interface IGroup {
  groupId: string;
  description: string;
}

export interface IGroupDocument extends IGroup, Document {}

export interface IGroupModel extends Model<IGroupDocument> {
  findByGroupId: typeof findByGroupId;
}
