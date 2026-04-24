import { Request, Response } from "express";
import { signupDTO } from "./auth.dto";
import { signupSchema } from "./auth.validation";
import { BadRequestException } from "../../Utils/response/error.response";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";

class AuthenticationService {
  constructor() {}

  signUp = async (req: Request, res: Response): Promise<Response> => {
    // DTO types
    const { username, email, password }: signupDTO = req.body;
    const user: HUserDocument = await new UserModel({});
    user.save();
    
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
