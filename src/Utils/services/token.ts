import jwt from "jsonwebtoken";
import { RoleEnum, SignatureEnum } from "../enums/auth.enum";
import {
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
  TOKEN_ACCESS_ADMIN_SECRET_KEY,
  TOKEN_ACCESS_USER_SECRET_KEY,
  TOKEN_REFRESH_ADMIN_SECRET_KEY,
  TOKEN_REFRESH_USER_SECRET_KEY,
} from "../../config/config.service";
import { v4 as uuid } from "uuid";

export class TokenService {
  constructor() {}

  sign = async (
    payload: object,
    secret: string,
    options?: jwt.SignOptions,
  ): Promise<string> => {
    return jwt.sign(payload, secret, options);
  };

  verify = async (token: string, secret: string) => {
    return jwt.verify(token, secret);
  };

  getSignature = ({ signatureLevel = SignatureEnum.USER }) => {
    let signature: { accessSignature: string; refereshSignature: string } = {
      accessSignature: "",
      refereshSignature: "",
    };

    switch (signatureLevel) {
      case SignatureEnum.ADMIN:
        signature.accessSignature = TOKEN_ACCESS_ADMIN_SECRET_KEY as string;
        signature.refereshSignature = TOKEN_REFRESH_ADMIN_SECRET_KEY as string;
        break;
      case SignatureEnum.USER:
        signature.accessSignature = TOKEN_ACCESS_USER_SECRET_KEY as string;
        signature.refereshSignature = TOKEN_REFRESH_USER_SECRET_KEY as string;
        break;
      default:
        signature.accessSignature = TOKEN_ACCESS_USER_SECRET_KEY as string;
        signature.refereshSignature = TOKEN_REFRESH_USER_SECRET_KEY as string;
        break;
    }

    return signature;
  };

  getNewLoginCredentials = async (user: { _id: string; role: RoleEnum }) => {
    const signature = await this.getSignature({
      signatureLevel:
        user.role != RoleEnum.ADMIN ? SignatureEnum.USER : SignatureEnum.ADMIN,
    });

    const jwtid = uuid();
    const accessToken = await this.sign(
      { id: user._id, jti: jwtid },
      signature.accessSignature,
      { expiresIn: Number(ACCESS_EXPIRES) },
    );
    const refreshToken = await this.sign(
      { id: user._id, jti: jwtid },
      signature.refereshSignature,
      { expiresIn: Number(REFRESH_EXPIRES) },
    );
    return { accessToken, refreshToken };
  };
}
