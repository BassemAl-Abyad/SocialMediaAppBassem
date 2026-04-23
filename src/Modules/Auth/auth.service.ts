import { Request, Response } from "express";
import { signupDTOBody } from "./auth.dto";
import { signupSchema } from "./auth.validation";
import { BadRequestException } from "../../Utils/response/error.response";

class AuthenticationService {
  constructor() {}

  signUp = async (req: Request, res: Response): Promise<Response> => {
    // DTO types
    const { username, email, password, confirmPassword }: signupDTOBody =
      req.body;

    return res.status(200).json({ message: "Signed up successfully." });
  };
  login = (req: Request, res: Response): Response => {
    return res.status(200).json({ message: "Login" });
  };
  logout = (req: Request, res: Response): Response => {
    return res.status(200).json({ message: "Logout" });
  };
}

export default new AuthenticationService();
