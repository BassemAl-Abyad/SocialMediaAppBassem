import mongoose from "mongoose";
import { DB_URI } from "../config/config.service";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(DB_URI as string, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected successfully on ${connection.connection.host}.`);
  } catch (error) {
    console.log(`MongoDB connection failed, error: ${(error as Error).message}`);
  }
};

export default connectDB;