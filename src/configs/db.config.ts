import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

import { dbLogger, errorLogger } from "../utils/logger.util";

const connectDatabase = async () => {
  try {
    // const mongoDbUrl = `mongodb+srv://${process.env.MONGO_USERNAME as string}:${
    //   process.env.MONGO_PASSWORD as string
    // }@${process.env.MONGO_HOST as string}/${process.env.MONGO_DB as string}`;
    const mongoDbUrl = `mongodb://${process.env.MONGO_HOST}:${
      process.env.MONGO_PORT
    }/${process.env.MONGO_DB as string}`;
    dbLogger(`Connecting to ${mongoDbUrl}...`);
    mongoose.Promise = global.Promise;

    // Connect to the database
    await mongoose.connect(mongoDbUrl);
    dbLogger(`Successfully connected to the database!`);
  } catch (error: any) {
    if (error instanceof Error) {
      errorLogger(error.message);
    } else {
      errorLogger("Interal Server Error!");
    }
    dbLogger("Could not connect to the database. Exiting now...");
    process.emit("SIGTERM");
  }
};

export default connectDatabase;
