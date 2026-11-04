import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { signupSchema } from "../validators/auth.validator.js";

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = signupSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { name, email, password } = parsed.data;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(409).json({
                message: "Email already registered!"
            });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            passwordHash,
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            res.status(409).json({
                message: "Email already registered"
            });
            return;
        }

        console.error("Signup error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};