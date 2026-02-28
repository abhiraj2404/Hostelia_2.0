// write a basic router 

import { Router } from "express";
import {
    getMenu, submitFeedback, getAllFeedbacks, updateMenu,
    createMess,
} from "../controllers/mess.controller.js";
import { authorizeRoles } from "../middleware/roles.js";

const router = Router();

// Create a new mess (collegeAdmin only)
router.post("/create", authorizeRoles('collegeAdmin'), createMess);
router.get("/menu", getMenu);
router.put("/menu", authorizeRoles('collegeAdmin', 'warden'), updateMenu);
router.post("/feedback", authorizeRoles('student'), submitFeedback);
router.get("/feedback", authorizeRoles('collegeAdmin', 'warden'), getAllFeedbacks);

export default router;
