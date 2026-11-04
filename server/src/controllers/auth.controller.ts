import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { signupSchema } from "../validators/auth.validator.js";
import jwt from "jsonwebtoken";
import { loginSchema } from "../validators/auth.validator.js";

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

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { email, password } = parsed.data;

        const user = await User.findOne({ email }).select("+passwordHash");

        if (!user) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }

        const isValidPassword = await bcrypt.compare(
            password,
            user.passwordHash,
        );

        if (!isValidPassword) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT SECRET is not configured");
        }

        const token = jwt.sign({
            userId: user._id.toString()
        }, jwtSecret, { expiresIn: "7d" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
} 