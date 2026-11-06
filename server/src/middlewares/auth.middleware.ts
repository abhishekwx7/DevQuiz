import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthPayload extends JwtPayload {
    userId: string;
}

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleWare = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Authentication token missing",
        });
        return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({
            message: "Authentication token missing",
        });
        return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({
            message: "Server configuration error",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (typeof decoded === "string" || typeof decoded.userId !== "string" || !decoded.userId) {
            res.status(401).json({
                message: "Invalid token payload",
            });
            return;
        }

        req.userId = decoded.userId;

        next();
    } catch {
        res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};