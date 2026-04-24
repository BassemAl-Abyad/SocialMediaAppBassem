import { hash, compare } from "bcrypt";
import { SALT } from "../../config/config.service";

export const generateHash = async (
  plaintext: string,
  saltRounds: number = Number(SALT),
): Promise<string> => {
  return await hash(plaintext, saltRounds);
};

export const compareHash = async (
  plaintext: string,
  hash: string,
): Promise<boolean> => {
  return await compare(plaintext, hash);
};