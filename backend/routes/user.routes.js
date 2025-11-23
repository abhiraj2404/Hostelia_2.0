import { Router } from "express";
import {
    getUserById,
    getAllStudents,
    getAllWardens,
} from "../controllers/user.controller.js";
import { authorizeRoles } from "../middleware/roles.js";

const router = Router();

// Protected routes - require authentication (authMiddleware applied in index.js)
// Specific routes must come before parameterized routes
// Get all students - admin and warden can access
router.get("/students/all", authorizeRoles("admin", "warden"), getAllStudents);

// Get all wardens - admin only
router.get("/wardens/all", authorizeRoles("admin"), getAllWardens);

// Get user by ID
router.get("/:userId", getUserById);

export default router;
