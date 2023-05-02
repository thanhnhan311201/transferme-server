import dotenv from "dotenv";
dotenv.config();

export const BASE_URL_API = process.env.BASE_URL_API as string;
export const BASE_URL_SERVER = process.env.BASE_URL_SERVER as string;
export const BASE_URL_CLIENT = process.env.BASE_URL_CLIENT as string;

export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY as string;
export const TOKEN_EXPIRATION_TIME = process.env
  .TOKEN_EXPIRATION_TIME as string;

export const GOOGLE_CREDENTIAL_CLIENT_ID = process.env
  .GOOGLE_CREDENTIAL_CLIENT_ID as string;
export const GOOGLE_CREDENTIAL_CLIENT_SECRET = process.env
  .GOOGLE_CREDENTIAL_CLIENT_SECRET as string;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI as string;
