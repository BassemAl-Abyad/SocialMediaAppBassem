import { Request, Response } from "express";
import { confirmEmailDTO, signupDTO } from "./auth.dto";
import { IUser, UserModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/repositories/user.repo";
import {
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { compareHash, generateHash } from "../../Utils/security/hash";
import { encrypt } from "../../Utils/security/encryption";
import { generateOTP } from "../../Utils/generateOTP";
import { emailEvents } from "../../Utils/events/email.events";

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

    const otp = generateOTP();

    const [firstName, lastName] = username.split(" ");
    const user = await this._userModel.create({
      data: [
        {
          firstName,
          lastName,
          username,
          email,
          password: await generateHash(password),
          phone: await encrypt(phone),
          confirmEmailOTP: await generateHash(otp),
        },
      ],
    });

    await emailEvents.emit("confirmEmail", { to: email, username, otp });

    return res
      .status(201)
      .json({ message: "User created successfully.", data: { user } });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: confirmEmailDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email,
        confirmEmailOTP: { $exists: true },
        confirmEmail: { $exists: false },
      },
    });

    if (!user)
      throw new NotFoundException("User not found or already confirmed.");

    if (!(await compareHash(otp, user?.confirmEmailOTP as string)))
      throw new NotFoundException("Invalid OTP.");

    await this._userModel.updateOne({
      filter: { email },
      update: {
        confirmEmail: new Date(),
        $unset: {
          confirmEmailOTP: true,
        },
      },
    });

    return res
      .status(200)
      .json({ message: "User confirmed successfully." });
  };
}

export default new AuthenticationService();
