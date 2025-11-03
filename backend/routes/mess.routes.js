// write a basic router 

import { Router } from "express";
import { getMenu, submitFeedback } from "../controllers/mess.controller.js";

const router = Router();

router.get("/menu", getMenu);
router.post("/feedback", submitFeedback);

export default router;
