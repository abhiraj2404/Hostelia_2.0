import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import apiRoutes from "./routes/index.js";
import { logger } from "./middleware/logger.js";

dotenv.config();

connectDB()
    .then(() => {
        logger.info("Connected to MongoDB");
        const app = express();

        // Middleware
        app.use(cors({
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true,
        }));
        app.use(express.json());
        app.use(cookieParser());
        app.use(express.urlencoded({ extended: true }));

        // Routes
        app.get("/", (req, res) => {
            res.send("Welcome to backend server of Hostelia");
        });

        app.use("/api", apiRoutes);

        // Start server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error("Database connection error:", err);
        process.exit(1);
    });
