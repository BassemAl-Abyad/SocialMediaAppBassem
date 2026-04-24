import { Request, Response } from "express";
import { signupDTO } from "./auth.dto";
import { IUser, UserModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/repositories/user.repo";
import { ConflictException } from "../../Utils/response/error.response";

class AuthenticationService {
  private _userModel = new UserRepository(UserModel);
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password }: signupDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: { email },
      select: "email",
    });

    if (checkUser) throw new ConflictException("User already exists.");
    const [firstName, lastName] = username.split(" ");
    const user = await this._userModel.create({
      data: [{ firstName, lastName, email, password }],
    });

    return res.status(201).json({ message: "User created successfully.", data: { user } });
  };
}

export default new AuthenticationService();