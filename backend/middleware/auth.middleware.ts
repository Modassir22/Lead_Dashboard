import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized - Token missing" });
            return;
        }
        const secret: string = process.env.JWT_SECRET || 'fallback_secret';
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                res.status(403).json({ message: "Forbidden - Invalid Token" });
                return;
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: "Unauthorized - Token missing" });
    }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden - Requires Admin role" });
    }
};
