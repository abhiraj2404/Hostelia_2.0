import { Router } from "express";
import { registerCollege, getCollegesList } from "../controllers/college.controller.js";

const router = Router();

// Public routes
router.post("/register", registerCollege);
router.get("/list", getCollegesList);

export default router;
