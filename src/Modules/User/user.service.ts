import { Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repo";
import { IUser, UserModel } from "../../DB/Models/user.model";
import { NotFoundException } from "../../Utils/response/error.response";

class UserService {
  private readonly _userRepo = new UserRepository(UserModel);

  constructor() {}

  getProfile = async (req: Request, res: Response) => {
    return res.status(200).json({ message: "Profile loaded.", data: req.user });
  };

  updateProfile = async (req: Request, res: Response) => {
    const updates = req.body as Partial<IUser>;
    const updated = await this._userRepo.findOneAndUpdate({
      filter: { _id: req.user._id },
      update: { ...updates },
      options: { new: true },
    });
    return res.status(200).json({ message: "Profile updated.", data: updated });
  };

  getUserById = async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const user = await this._userRepo.findOne({
      filter: { _id: userId },
      select: "firstName lastName username email phone address gender role ProfilePic createdAt",
    });
    if (!user) throw new NotFoundException("User not found.");
    return res.status(200).json({ message: "User loaded.", data: user });
  };
}

export default new UserService();