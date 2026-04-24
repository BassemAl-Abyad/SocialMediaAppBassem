import { Model } from "mongoose";
import { DatabaseRepository } from "../database.repository";
import { IUser } from "../Models/user.model";

export class UserRepository extends DatabaseRepository<IUser> {
  constructor(protected override readonly model: Model<IUser>) {
    super(model);
  }
}