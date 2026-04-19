import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import jwt from "jsonwebtoken";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/roles.js";
import { domainValidation } from "../middleware/domainValidation.middleware.js";
import College from "../models/college.model.js";
import User from "../models/user.model.js";
import {
  clearTestDatabase,
  closeTestDatabase,
  connectTestDatabase,
} from "./testUtils.js";

describe("Middleware", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("returns 401 when auth token is missing", async () => {
    const testApp = express();
    testApp.use(cookieParser());
    testApp.get("/secure", authMiddleware, (req, res) => res.json({ ok: true }));

    const res = await request(testApp).get("/secure");
    expect(res.status).toBe(401);
  });

  it("allows request with valid JWT token", async () => {
    const college = await College.create({
      name: "College",
      emailDomain: "@test.edu",
      adminEmail: "admin@test.edu",
      status: "approved",
    });
    const user = await User.create({
      name: "Token User",
      email: "token@test.edu",
      password: "pass123",
      role: "student",
      rollNo: "111",
      collegeId: college._id,
    });
    const token = jwt.sign({ userID: user._id.toString() }, process.env.JWT_SECRET);

    const testApp = express();
    testApp.use(cookieParser());
    testApp.get("/secure", authMiddleware, (req, res) => res.json({ ok: true }));

    const res = await request(testApp).get("/secure").set("Cookie", [`jwt=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("blocks unauthorized role", async () => {
    const testApp = express();
    testApp.get(
      "/admin",
      (req, res, next) => {
        req.user = { role: "student" };
        next();
      },
      authorizeRoles("collegeAdmin"),
      (req, res) => res.json({ ok: true })
    );

    const res = await request(testApp).get("/admin");
    expect(res.status).toBe(403);
  });

  it("rejects domain mismatch in domainValidation", async () => {
    const college = await College.create({
      name: "Mismatch College",
      emailDomain: "@college.edu",
      adminEmail: "admin@college.edu",
      status: "approved",
    });

    const testApp = express();
    testApp.use(express.json());
    testApp.post("/check-domain", domainValidation, (req, res) =>
      res.json({ ok: true })
    );

    const res = await request(testApp).post("/check-domain").send({
      email: "user@other.edu",
      collegeId: college._id.toString(),
    });

    expect(res.status).toBe(403);
  });
});
