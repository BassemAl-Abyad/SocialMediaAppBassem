import mongoose, { HydratedDocument, Schema } from "mongoose";
import { GenderEnum, RoleEnum } from "../../Utils/enums/auth.enum";

// Interface

export interface IUser {
  firstName: string;
  lastName: string;
  username: string;

  email: string;
  confirmEmailOTP?: string;
  confirmEmail?: Date;

  password: string;
  resetPasswordOTP?: string;

  phone: string;
  address?: string;

  gender: GenderEnum;
  role?: RoleEnum;

  createdAt?: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 25,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 25,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 41,
      unique: true,
    },
        email: {
      type: String,
      required: true,
      unique: true,
    },
    confirmEmailOTP: {
      type: String,
    },
    confirmEmail: {
      type: Date,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordOTP: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);


export const UserModel = mongoose.model("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>;
