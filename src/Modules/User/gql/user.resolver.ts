import { IUser } from "../../../DB/Models/user.model";
import userService from "../user.service";

export class UserResolver {
  getProfile = async (_: any, __: any, { user }: { user: IUser }) => {
    return await userService.getProfile(user);
  };
}

export const userResolver = new UserResolver();