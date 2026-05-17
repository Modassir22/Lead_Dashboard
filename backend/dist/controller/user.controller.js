import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ message: "Name, email and password are required" });
        return;
    }
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(409).json({ message: "User already Exists" });
            return;
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            email: email,
            password: hashPassword,
            role: role || "sales_user" // default to sales_user
        });
        await newUser.save();
        res.status(201).json({ message: "User Created Successfully" });
    }
    catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` });
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            message: "Please fill all the fields"
        });
        return;
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({
                message: "User Not Found"
            });
            return;
        }
        if (!user.password) {
            res.status(401).json({ message: "Invalid Credentials" });
            return;
        }
        const comparedPassword = await bcrypt.compare(password, user.password);
        if (!comparedPassword) {
            res.status(401).json({
                message: "Invalid Credentials"
            });
            return;
        }
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1d' });
        user.token = token;
        await user.save();
        res.status(200).json({
            token: token,
            role: user.role,
            name: user.name,
            email: user.email
        });
    }
    catch (e) {
        res.status(500).json({
            message: `Something went wrong ${e}`
        });
    }
};
export { login, register };
//# sourceMappingURL=user.controller.js.map