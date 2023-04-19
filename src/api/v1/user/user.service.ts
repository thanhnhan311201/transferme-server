import jwt, { Jwt, type JwtPayload } from "jsonwebtoken";
import { auth, OAuth2Client, type Credentials } from "google-auth-library";
import bcrypt from "bcryptjs";

import User from "./user.model";

import { genRandomName, ResponseError } from "../helpers";
import {
  SECRET_JWT_KEY,
  GOOGLE_CREDENTIAL_CLIENT_ID,
  GOOGLE_CREDENTIAL_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  TOKEN_EXPIRATION_TIME,
} from "../../../configs/general.config";
import { IUserModel } from "../../../configs/interfaces.config";

const client = new OAuth2Client(
  GOOGLE_CREDENTIAL_CLIENT_ID,
  GOOGLE_CREDENTIAL_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

namespace userService {
  export const signup = async (email: string, password: string) => {
    const hashPassword = bcrypt.hashSync(password, 12);
    const user = new User({
      email: email,
      password: hashPassword,
      name: genRandomName(12),
      picture: "/images/user.png",
      provider: "transferme",
    });

    return await user.save();
  };

  export const login = async (email: string, password: string) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      const err = new ResponseError(
        "The user with this email could not be found!",
        401
      );
      throw err;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      const err = new ResponseError("Wrong password", 401);
      throw err;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      SECRET_JWT_KEY,
      { expiresIn: TOKEN_EXPIRATION_TIME }
    );

    return {
      token: token,
      user: user,
    };
  };

  export const googleLogin = async (authCode: string) => {
    const { tokens }: { tokens: Credentials; res: any } = await client.getToken(
      authCode
    );
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CREDENTIAL_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      const err = new ResponseError("User not found", 401);
      throw err;
    }

    let savedUser: IUserModel;
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      const user = new User({
        email: payload.email,
        password: bcrypt.hashSync(genRandomName(8), 12),
        name: payload.name,
        picture: payload.picture,
        provider: "google",
      });
      savedUser = await user.save();
    } else {
      user.email = payload.email!;
      user.name = payload.name!;
      user.picture = payload.picture!;
      savedUser = await user.save();
    }

    const token = jwt.sign(
      {
        email: savedUser.email,
        userId: savedUser._id!.toString(),
      },
      SECRET_JWT_KEY,
      { expiresIn: TOKEN_EXPIRATION_TIME }
    );

    return {
      token: token,
      user: user,
    };
  };

  export const verifyToken = async (token: string) => {
    try {
      const decodedToken = jwt.verify(token, SECRET_JWT_KEY) as JwtPayload;
      if (!decodedToken) {
        throw new ResponseError("User not found!", 401);
      }

      const user = await User.findOne({ _id: decodedToken.userId });
      if (!user) {
        throw new ResponseError("User not found!", 401);
      }

      return user;
    } catch (error) {
      if (error) {
        throw error;
      }
      throw new ResponseError("User not found!", 401);
    }
  };
}

export default userService;
