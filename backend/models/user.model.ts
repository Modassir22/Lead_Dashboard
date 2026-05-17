import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    token?: string;
    role: "admin" | "sales_user";
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String
    },
    role: {
        type: String,
        enum: ["admin", "sales_user"],
        default: "sales_user"
    }
});

const User = mongoose.model<IUser>("User", userSchema);

export { User };
