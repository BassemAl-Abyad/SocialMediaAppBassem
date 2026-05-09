import { Request, Response } from "express";
import {
  confirmEmailDTO,
  signupDTO,
  resetPasswordDTO,
  resetPasswordConfirmDTO,
  resendOTPDTO,
  verifyAccountDTO,
  loginDTO,
} from "./auth.dto";
import { IUser, UserModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/repositories/user.repo";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { compareHash, generateHash } from "../../Utils/security/hash";
import { encrypt } from "../../Utils/security/encryption";
import { generateOTP } from "../../Utils/generateOTP";
import { emailEvents } from "../../Utils/events/email.events";
import { TokenService } from "../../Utils/services/token";
import { LogoutTypeEnum, ProviderEnum } from "../../Utils/enums/auth.enum";
import { revokeTokenKey, set } from "../../DB/repositories/redis.service";
import { ACCESS_EXPIRES, CLIENT_ID } from "../../config/config.service";
import { OAuth2Client } from "google-auth-library";

class AuthenticationService {
  private _userRepo = new UserRepository(UserModel);
  private _tokenService: TokenService;
  constructor() {
    this._tokenService = new TokenService();
  }

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password, phone }: signupDTO = req.body;

    const checkUser = await this._userRepo.findOne({
      filter: { email },
      select: "email",
    });

    if (checkUser) throw new ConflictException("User already exists.");

    const otp = generateOTP();

    const [firstName, lastName] = username.split(" ");
    const user = await this._userRepo.create({
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

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: loginDTO = req.body;

    const user = await this._userRepo.findOne({
      filter: { email, confirmEmail: { $exists: true } },
    });
    if (!user)
      throw new NotFoundException("User not found or already confirmed.");

    if (!(await compareHash(password, user.password)))
      throw new BadRequestException("Invalid email or password.");

    const credentials = await this._tokenService.getNewLoginCredentials(
      user as any,
    );

    return res
      .status(201)
      .json({ message: "User logged in successfully.", data: { credentials } });
  };

  verifyGoogleAccount = async ({ idToken }: { idToken: string }) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  };

  loginWithGoogle = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    const { picture, email, given_name, family_name, email_verified }: any =
      await this.verifyGoogleAccount({ idToken });

    if (!email_verified) throw new BadRequestException("Email not verified.");

    const user = await this._userRepo.findOne({
      filter: { email },
    });

    if (user) {
      // User Login
      if (user.provider === ProviderEnum.GOOGLE) {
        const credentials = await this._tokenService.getNewLoginCredentials(
          user as any,
        );
        return res
          .status(200)
          .json({ message: "Logged in successfully.", data: { credentials } });
      }
    }

    // User Create
    const newUser = await this._userRepo.create({
      data: {
        firstName: given_name,
        lastName: family_name,
        email,
        ProfilePic: picture,
        provider: ProviderEnum.GOOGLE,
      },
    });

    const credentials = await this._tokenService.getNewLoginCredentials(
      newUser as any,
    );
    return res
      .status(201)
      .json({ message: "Logged in successfully.", data: { credentials } });
  };

  logoutWithRedis = async (req: Request, res: Response): Promise<Response> => {
    const { flag } = req.body;

    let status = 200;
    switch (flag) {
      case LogoutTypeEnum.LOGOUT:
        await set({
          key: revokeTokenKey({ userId: req.decoded.id, jti: req.decoded.jti }),
          value: req.decoded.jti,
          ttl: Number(ACCESS_EXPIRES), // 3600
        });
        status = 201;
        break;
      case LogoutTypeEnum.LOGOUT_FROM_ALL:
        await this._userRepo.updateOne({
          filter: { _id: req.decoded.id },
          update: {
            changeCredentialTime: Date.now(),
          },
        });
        status = 200;
        break;
    }
    return res.status(status).json({ message: "Logout successful." });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: confirmEmailDTO = req.body;

    const user = await this._userRepo.findOne({
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

    await this._userRepo.updateOne({
      filter: { email },
      update: {
        confirmEmail: new Date(),
        $unset: {
          confirmEmailOTP: true,
        },
      },
    });

    return res.status(200).json({ message: "User confirmed successfully." });
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email }: resetPasswordDTO = req.body;

    const user = await this._userRepo.findOne({
      filter: { email },
      select: "username email",
    });

    if (!user) throw new NotFoundException("User not found.");

    const otp = generateOTP();

    await this._userRepo.updateOne({
      filter: { email },
      update: {
        resetPasswordOTP: await generateHash(otp),
      },
    });

    await emailEvents.emit("resetPasswordOTP", {
      to: email,
      username: user.username,
      otp,
    });

    return res
      .status(200)
      .json({ message: "Reset password OTP sent successfully." });
  };

  resetPasswordConfirm = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { email, otp, newPassword }: resetPasswordConfirmDTO = req.body;

    const user = await this._userRepo.findOne({
      filter: {
        email,
        resetPasswordOTP: { $exists: true },
      },
    });

    if (!user)
      throw new NotFoundException("User not found or no reset request.");

    if (!(await compareHash(otp, user?.resetPasswordOTP as string)))
      throw new NotFoundException("Invalid OTP.");

    await this._userRepo.updateOne({
      filter: { email },
      update: {
        password: await generateHash(newPassword),
        $unset: {
          resetPasswordOTP: true,
        },
      },
    });

    return res.status(200).json({ message: "Password reset successfully." });
  };

  resendOTP = async (req: Request, res: Response): Promise<Response> => {
    const { email }: resendOTPDTO = req.body;

    const user = await this._userRepo.findOne({
      filter: {
        email,
        confirmEmail: { $exists: false },
      },
      select: "username email",
    });

    if (!user)
      throw new NotFoundException("User not found or already confirmed.");

    const otp = generateOTP();

    await this._userRepo.updateOne({
      filter: { email },
      update: {
        confirmEmailOTP: await generateHash(otp),
      },
    });

    await emailEvents.emit("confirmEmail", {
      to: email,
      username: user.username,
      otp,
    });

    return res.status(200).json({ message: "OTP resent successfully." });
  };

  verifyAccount = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: verifyAccountDTO = req.body;

    const user = await this._userRepo.findOne({
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

    await this._userRepo.updateOne({
      filter: { email },
      update: {
        confirmEmail: new Date(),
        $unset: {
          confirmEmailOTP: true,
        },
      },
    });

    return res.status(200).json({ message: "Account verified successfully." });
  };
}

export default new AuthenticationService();
