import mongoose, { HydratedDocument, Schema } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/enums/auth.enum";
import { generateHash } from "../../Utils/security/hash";
import { encrypt } from "../../Utils/security/encryption";
import { emailEvents } from "../../Utils/events/email.events";
import { generateOTP } from "../../Utils/generateOTP";

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
  provider?: ProviderEnum;
  changeCredentialTime: Date;
  ProfilePic?: string;

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
      required: function (): boolean {
        return this.provider === ProviderEnum.SYSTEM;
      },
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
    changeCredentialTime: { type: Date },
    ProfilePic: {
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
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre("save", async function (this: HUserDocument & {wasNew: boolean}) {
  this.wasNew = this.isNew;
  if (this.isModified("password")) {
    this.password = await generateHash(this.password);
  }
  if (this.isModified("phone")) {
    this.phone = await encrypt(this.phone);
  }
});

userSchema.post("save", async function () {
  const that = this as HUserDocument & {wasNew: boolean};
  if (that.wasNew) {
  await emailEvents.emit("confirmEmail", {
    otp: generateOTP(),
    to: this.email,
    username: this.username,
  });
}
});

export const UserModel = mongoose.model("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>;
