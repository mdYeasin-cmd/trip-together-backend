import bcrypt from "bcrypt";
import config from "../config";

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcrypt_salt_rounds);
};

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const bcryptHelpers = {
  hashPassword,
  comparePassword,
};
