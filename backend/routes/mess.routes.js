// write a basic router 

import { Router } from "express";
import { getMenu, submitFeedback, getAllFeedbacks } from "../controllers/mess.controller.js";
import { authorizeRoles } from "../middleware/roles.js";

const router = Router();

router.get("/menu", getMenu);
router.post("/feedback", authorizeRoles('student'), submitFeedback);
router.get("/feedback", authorizeRoles('admin', 'warden'), getAllFeedbacks);

export default router;
