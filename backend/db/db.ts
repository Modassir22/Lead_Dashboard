import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function dbConnection(): Promise<void> {
    if (!process.env.MONGO_URI) {
        console.log("MONGO_URI is not defined");
        return;
    }
    await mongoose.connect(process.env.MONGO_URI);
}

export { dbConnection };
