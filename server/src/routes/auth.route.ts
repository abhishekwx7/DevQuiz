import { Router } from "express";
import { signup } from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";
import { authMiddleWare, type AuthRequest } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleWare, (req: AuthRequest, res) => {
    res.json({
        message: "Protected route accessed",
        userId: req.userId,
    })
})

export default router;