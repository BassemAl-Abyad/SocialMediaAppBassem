import { Request, Response } from "express";
import { signupDTO } from "./auth.dto";
import { IUser, UserModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/repositories/user.repo";
import { ConflictException } from "../../Utils/response/error.response";
import { generateHash } from "../../Utils/security/hash";
import { encrypt } from "../../Utils/security/encryption";

class AuthenticationService {
  private _userModel = new UserRepository(UserModel);
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password, phone }: signupDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: { email },
      select: "email",
    });

    if (checkUser) throw new ConflictException("User already exists.");
    const [firstName, lastName] = username.split(" ");
    const user = await this._userModel.create({
      data: [{ firstName, lastName, email, password: await generateHash(password), phone: await encrypt(phone) }],
    });

    return res.status(201).json({ message: "User created successfully.", data: { user } });
  };
}

export default new AuthenticationService();