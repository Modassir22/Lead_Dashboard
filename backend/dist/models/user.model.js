import mongoose, { Schema, Document } from "mongoose";
const userSchema = new Schema({
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
const User = mongoose.model("User", userSchema);
export { User };
//# sourceMappingURL=user.model.js.map