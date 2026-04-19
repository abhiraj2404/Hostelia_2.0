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
  createTestCollege,
  createTestStudent,
  createTestHostel,
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

  // --- authMiddleware ---

  it("returns 401 when auth token is missing", async () => {
    const testApp = express();
    testApp.use(cookieParser());
    testApp.get("/secure", authMiddleware, (req, res) => res.json({ ok: true }));

    const res = await request(testApp).get("/secure");
    expect(res.status).toBe(401);
  });

  it("allows request with valid JWT token", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const user = await createTestStudent(college._id, hostel._id);
    const token = jwt.sign({ userID: user._id.toString() }, process.env.JWT_SECRET);

    const testApp = express();
    testApp.use(cookieParser());
    testApp.get("/secure", authMiddleware, (req, res) => res.json({ ok: true }));

    const res = await request(testApp).get("/secure").set("Cookie", [`jwt=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("rejects expired JWT token", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const user = await createTestStudent(college._id, hostel._id);
    const token = jwt.sign(
      { userID: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "0s" }
    );

    const testApp = express();
    testApp.use(cookieParser());
    testApp.get("/secure", authMiddleware, (req, res) => res.json({ ok: true }));

    const res = await request(testApp).get("/secure").set("Cookie", [`jwt=${token}`]);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  it("rejects malformed JWT token", async () => {
    const testApp = express();
    testApp.use(cookieParser());
    testApp.get("/secure", authMiddleware, (req, res) => res.json({ ok: true }));

    const res = await request(testApp).get("/secure").set("Cookie", ["jwt=not.a.valid.token"]);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  // --- authorizeRoles ---

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

  it("allows request when role matches", async () => {
    const testApp = express();
    testApp.get(
      "/warden-area",
      (req, res, next) => {
        req.user = { role: "warden" };
        next();
      },
      authorizeRoles("warden", "collegeAdmin"),
      (req, res) => res.json({ ok: true })
    );

    const res = await request(testApp).get("/warden-area");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("returns 401 when no user is attached to request", async () => {
    const testApp = express();
    testApp.get("/secured", authorizeRoles("student"), (req, res) => res.json({ ok: true }));

    const res = await request(testApp).get("/secured");
    expect(res.status).toBe(401);
  });

  // --- domainValidation ---

  it("rejects domain mismatch in domainValidation", async () => {
    const college = await createTestCollege({ emailDomain: "@college.edu", adminEmail: "admin@college.edu" });

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

  it("passes domainValidation when email matches college domain", async () => {
    const college = await createTestCollege();

    const testApp = express();
    testApp.use(express.json());
    testApp.post("/check-domain", domainValidation, (req, res) =>
      res.json({ ok: true })
    );

    const res = await request(testApp).post("/check-domain").send({
      email: "user@test.edu",
      collegeId: college._id.toString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
