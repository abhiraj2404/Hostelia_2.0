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
        const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:5174,http://localhost:3000")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);

        app.use(
            cors({
                origin: (origin, callback) => {
                    // Allow non-browser requests or same-origin
                    if (!origin) return callback(null, true);
                    if (
                        allowedOrigins.includes(origin) ||
                        /^http:\/\/localhost:\d+$/.test(origin)
                    ) {
                        return callback(null, true);
                    }
                    return callback(new Error("Not allowed by CORS"));
                },
                credentials: true,
            })
        );
        app.use(express.json());
        app.use(cookieParser());
        app.use(express.urlencoded({ extended: true }));

        // Routes
        app.get("/", (req, res) => {
            res.send("Welcome to backend server of Hostelia");
        });

        app.use("/api", apiRoutes);

        app.use((err, req, res, next) => {
            console.error(err);

            const statusCode = err.statusCode || 500;
            const message = err.message || "Something went wrong on the server";

            res.status(statusCode).json({
                success: false,
                message,
            });
        })

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
