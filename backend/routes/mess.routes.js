// write a basic router 

import { Router } from "express";
import { getMenu, submitFeedback, getAllFeedbacks, updateMenu } from "../controllers/mess.controller.js";
import { authorizeRoles } from "../middleware/roles.js";

const router = Router();

router.get("/menu", getMenu);
router.put("/menu", authorizeRoles('admin', 'warden'), updateMenu);
router.post("/feedback", authorizeRoles('student'), submitFeedback);
router.get("/feedback", authorizeRoles('admin', 'warden'), getAllFeedbacks);

export default router;
