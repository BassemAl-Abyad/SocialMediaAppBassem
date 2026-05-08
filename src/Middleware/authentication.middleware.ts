import { NextFunction, Request, Response } from "express";
import { RoleEnum, TokenTypeEnum } from "../Utils/enums/auth.enum";
import { TokenService } from "../Utils/services/token";
import { BadRequestException, ForbiddenException } from "../Utils/response/error.response";

export const authentication = ({ tokenType = TokenTypeEnum.ACCESS }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tokenService = new TokenService();
    if (!req.headers.authorization)
      throw new BadRequestException("Authorization header is missing.");
    const { user, decoded } =
      (await tokenService.decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};

    req.user = user;
    req.decoded = decoded;

    return next();
  };
};

export const authorization = ({
  accessRoles = [],
}: {
  accessRoles?: RoleEnum[];
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.role || !accessRoles.includes(req.user.role)) {
      throw new ForbiddenException("Forbidden request.");
    }

    return next();
  };
};
