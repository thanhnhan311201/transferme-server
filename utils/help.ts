import mongoose from "mongoose";

export const catchSync = <Fn extends (...args: any) => any>(
  fn: Fn,
  ...args: Parameters<Fn>
): [ReturnType<Fn> | undefined, any] => {
  try {
    const result = fn(args);
    return [result, undefined];
  } catch (error) {
    return [undefined, error];
  }
};

export const catchAsync = async <Fn extends (...args: any) => any>(
  fn: Fn,
  ...args: Parameters<Fn>
): Promise<[ReturnType<Fn> | undefined, any]> => {
  try {
    const result = fn(args);
    return [result, undefined];
  } catch (error) {
    return [undefined, error];
  }
};

export class ResponseError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
  }
}

export const genRandomName = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_";
  const charLength = chars.length;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }

  return result;
};

export interface IUserModel {
  _id?: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password: string;
  picture: string;
  provider: string;
}

export interface IJWT {
  userId: string;
  email: string;
}
