import express from "express"
import cors from "cors"

import authRoutes from "../src/routes/auth.route.js"

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Hello" })
})

export default app;