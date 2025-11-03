import jwt from "jsonwebtoken";
import { logger } from "./logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

/**
 * Auth middleware to protect routes
 * Verifies JWT token from cookies
 */
export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userID;

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            logger.warn("Invalid JWT token attempt");
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token",
            });
        }
        if (error.name === "TokenExpiredError") {
            logger.warn("Expired JWT token attempt");
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Token expired",
            });
        }
        logger.error("Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


