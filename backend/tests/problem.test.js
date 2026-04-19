import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { app } from "../index.js";
import College from "../models/college.model.js";
import Hostel from "../models/hostel.model.js";
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";
import {
  authCookieFor,
  clearTestDatabase,
  closeTestDatabase,
  connectTestDatabase,
} from "./testUtils.js";

describe("Problem API", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("requires problem image for create endpoint", async () => {
    const college = await College.create({
      name: "Test College",
      emailDomain: "@test.edu",
      adminEmail: "admin@test.edu",
      status: "approved",
    });
    const hostel = await Hostel.create({ name: "A Block", collegeId: college._id });
    const student = await User.create({
      name: "Student One",
      email: "student@test.edu",
      rollNo: "121",
      password: "hashed-pass",
      role: "student",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "10",
    });

    const res = await request(app)
      .post("/api/problem")
      .set("Cookie", [authCookieFor(student._id)])
      .send({
        problemTitle: "Water leak",
        problemDescription: "Pipe leaking in room",
        category: "Plumbing",
        hostelId: hostel._id.toString(),
        roomNo: "10",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/image is required/i);
  });

  it("lists only in-scope student problems", async () => {
    const college = await College.create({
      name: "Scope College",
      emailDomain: "@scope.edu",
      adminEmail: "admin@scope.edu",
      status: "approved",
    });
    const hostel = await Hostel.create({ name: "H1", collegeId: college._id });
    const student = await User.create({
      name: "Scoped Student",
      email: "scoped@scope.edu",
      rollNo: "122",
      password: "hashed-pass",
      role: "student",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "11",
    });
    const otherStudent = await User.create({
      name: "Other Student",
      email: "other@scope.edu",
      rollNo: "123",
      password: "hashed-pass",
      role: "student",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "12",
    });

    await Problem.create({
      problemTitle: "Internet down",
      problemDescription: "No wifi",
      problemImage: "https://example.com/img1.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "11",
      category: "Internet",
      studentId: student._id,
    });
    await Problem.create({
      problemTitle: "Fan issue",
      problemDescription: "Fan not working",
      problemImage: "https://example.com/img2.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "12",
      category: "Electrical",
      studentId: otherStudent._id,
    });

    const res = await request(app)
      .get("/api/problem")
      .set("Cookie", [authCookieFor(student._id)]);

    expect(res.status).toBe(200);
    expect(res.body.problems.length).toBe(1);
    expect(res.body.problems[0].roomNo).toBe("11");
  });
});
