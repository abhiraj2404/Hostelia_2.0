import { Router } from "express";
// import userRouter from "./user.routes.js";
import authRouter from "./auth.routes.js";

const router = Router();

// API routes
// router.use("/user", userRouter);
router.use("/auth", authRouter);
// router.use("/menu", menuRouter);

export default router;
