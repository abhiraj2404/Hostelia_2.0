import request from "supertest";
import bcrypt from "bcrypt";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { app } from "../index.js";
import College from "../models/college.model.js";
import Hostel from "../models/hostel.model.js";
import User from "../models/user.model.js";
import {
  authCookieFor,
  clearTestDatabase,
  closeTestDatabase,
  connectTestDatabase,
  createTestCollege,
  createTestHostel,
  createTestStudent,
} from "./testUtils.js";

describe("Auth API", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("signs up student successfully", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);

    const res = await request(app).post("/api/auth/signup").send({
      name: "Alice Student",
      rollNo: "101",
      email: "alice@test.edu",
      collegeId: college._id.toString(),
      hostelId: hostel._id.toString(),
      roomNo: "101",
      password: "secret123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe("alice@test.edu");
  });

  it("rejects signup with duplicate email", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    await createTestStudent(college._id, hostel._id);

    const res = await request(app).post("/api/auth/signup").send({
      name: "Alice Student",
      rollNo: "202",
      email: "student@test.edu",
      collegeId: college._id.toString(),
      hostelId: hostel._id.toString(),
      roomNo: "11",
      password: "secret123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("rejects signup with invalid roll number format", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);

    const res = await request(app).post("/api/auth/signup").send({
      name: "Alice Student",
      rollNo: "ab",
      email: "alice@test.edu",
      collegeId: college._id.toString(),
      hostelId: hostel._id.toString(),
      roomNo: "101",
      password: "secret123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("logs in student with correct password", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    await createTestStudent(college._id, hostel._id);

    const res = await request(app).post("/api/auth/login").send({
      email: "student@test.edu",
      password: "password123",
      collegeId: college._id.toString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe("student");
  });

  it("rejects login with wrong password", async () => {
    const hashedPassword = await bcrypt.hash("correctpass", 1);
    const college = await createTestCollege();
    await User.create({
      name: "Bob",
      email: "bob@test.edu",
      rollNo: "102",
      password: hashedPassword,
      role: "student",
      collegeId: college._id,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "bob@test.edu",
      password: "wrongpass",
      collegeId: college._id.toString(),
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid Credentials/i);
  });

  it("rejects login for non-existent user", async () => {
    const college = await createTestCollege();

    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.edu",
      password: "somepass",
      collegeId: college._id.toString(),
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid Credentials/i);
  });

  it("rejects login for pending college", async () => {
    const college = await createTestCollege({ status: "pending" });
    const hashedPassword = await bcrypt.hash("pass123", 1);
    await User.create({
      name: "Pending User",
      email: "pending@test.edu",
      rollNo: "103",
      password: hashedPassword,
      role: "student",
      collegeId: college._id,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "pending@test.edu",
      password: "pass123",
      collegeId: college._id.toString(),
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("logs in manager with valid credentials", async () => {
    const hashedPassword = await bcrypt.hash("managerpass", 1);
    await User.create({
      name: "Manager",
      email: "manager@hostelia.com",
      password: hashedPassword,
      role: "manager",
    });

    const res = await request(app).post("/api/auth/manager-login").send({
      email: "manager@hostelia.com",
      password: "managerpass",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe("manager");
  });

  it("rejects manager login with wrong password", async () => {
    const hashedPassword = await bcrypt.hash("correctpass", 1);
    await User.create({
      name: "Manager",
      email: "manager@hostelia.com",
      password: hashedPassword,
      role: "manager",
    });

    const res = await request(app).post("/api/auth/manager-login").send({
      email: "manager@hostelia.com",
      password: "wrongpass",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("logout clears cookies and returns 200", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", [authCookieFor(student._id)]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
