import request from "supertest";
import bcrypt from "bcrypt";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { app } from "../index.js";
import College from "../models/college.model.js";
import Hostel from "../models/hostel.model.js";
import User from "../models/user.model.js";
import {
  clearTestDatabase,
  closeTestDatabase,
  connectTestDatabase,
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
    const college = await College.create({
      name: "Test College",
      emailDomain: "@test.edu",
      adminEmail: "admin@test.edu",
      status: "approved",
    });
    const hostel = await Hostel.create({ name: "A Block", collegeId: college._id });

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

  it("rejects login with wrong password", async () => {
    const hashedPassword = await bcrypt.hash("correctpass", 10);
    const college = await College.create({
      name: "Test College",
      emailDomain: "@test.edu",
      adminEmail: "admin@test.edu",
      status: "approved",
    });
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

  it("logs in manager with valid credentials", async () => {
    const hashedPassword = await bcrypt.hash("managerpass", 10);
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
});
