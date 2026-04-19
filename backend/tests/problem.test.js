import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { app } from "../index.js";
import Problem from "../models/problem.model.js";
import {
  authCookieFor,
  clearTestDatabase,
  closeTestDatabase,
  connectTestDatabase,
  createTestCollege,
  createTestHostel,
  createTestStudent,
  createTestWarden,
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
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);

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
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    const otherStudent = await createTestStudent(college._id, hostel._id, {
      email: "other@test.edu",
      rollNo: "202",
      roomNo: "12",
    });

    await Problem.create({
      problemTitle: "Internet down",
      problemDescription: "No wifi",
      problemImage: "https://example.com/img1.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "10",
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
    expect(res.body.problems[0].roomNo).toBe("10");
  });

  it("warden can update problem status", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    const warden = await createTestWarden(college._id, hostel._id);

    const problem = await Problem.create({
      problemTitle: "Broken window",
      problemDescription: "Glass cracked",
      problemImage: "https://example.com/img.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "10",
      category: "Carpentry",
      studentId: student._id,
    });

    const res = await request(app)
      .patch(`/api/problem/${problem._id}/status`)
      .set("Cookie", [authCookieFor(warden._id)])
      .send({ status: "Resolved" });

    expect(res.status).toBe(200);
    expect(res.body.problem.status).toBe("Resolved");
  });

  it("warden cannot update status of problem in another hostel", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const otherHostel = await createTestHostel(college._id, { name: "B Block" });
    const student = await createTestStudent(college._id, hostel._id);
    const warden = await createTestWarden(college._id, otherHostel._id, {
      email: "warden2@test.edu",
    });

    const problem = await Problem.create({
      problemTitle: "Leaky pipe",
      problemDescription: "Water dripping",
      problemImage: "https://example.com/img.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "10",
      category: "Plumbing",
      studentId: student._id,
    });

    const res = await request(app)
      .patch(`/api/problem/${problem._id}/status`)
      .set("Cookie", [authCookieFor(warden._id)])
      .send({ status: "Resolved" });

    expect(res.status).toBe(403);
  });

  it("rejects invalid problem status value", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const warden = await createTestWarden(college._id, hostel._id);
    const student = await createTestStudent(college._id, hostel._id);

    const problem = await Problem.create({
      problemTitle: "Noisy fan",
      problemDescription: "Makes noise",
      problemImage: "https://example.com/img.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "10",
      category: "Electrical",
      studentId: student._id,
    });

    const res = await request(app)
      .patch(`/api/problem/${problem._id}/status`)
      .set("Cookie", [authCookieFor(warden._id)])
      .send({ status: "InvalidStatus" });

    expect(res.status).toBe(400);
  });

  it("student can add comment to own problem", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);

    const problem = await Problem.create({
      problemTitle: "Flickering light",
      problemDescription: "Light flickers at night",
      problemImage: "https://example.com/img.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "10",
      category: "Electrical",
      studentId: student._id,
    });

    const res = await request(app)
      .post(`/api/problem/${problem._id}/comments`)
      .set("Cookie", [authCookieFor(student._id)])
      .send({ message: "Still not fixed after two days" });

    expect(res.status).toBe(201);
    expect(res.body.problem.comments).toHaveLength(1);
    expect(res.body.problem.comments[0].message).toBe("Still not fixed after two days");
  });

  it("returns 404 when adding comment to non-existent problem", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/problem/${fakeId}/comments`)
      .set("Cookie", [authCookieFor(student._id)])
      .send({ message: "Hello?" });

    expect(res.status).toBe(404);
  });

  it("student can verify problem resolution", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);

    const problem = await Problem.create({
      problemTitle: "Broken door",
      problemDescription: "Lock jammed",
      problemImage: "https://example.com/img.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "10",
      category: "Carpentry",
      studentId: student._id,
      status: "ToBeConfirmed",
    });

    const res = await request(app)
      .patch(`/api/problem/${problem._id}/verify`)
      .set("Cookie", [authCookieFor(student._id)])
      .send({ studentStatus: "Resolved" });

    expect(res.status).toBe(200);
    expect(res.body.problem.studentStatus).toBe("Resolved");
    expect(res.body.problem.status).toBe("Resolved");
  });

  it("student cannot verify another student's problem", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    const otherStudent = await createTestStudent(college._id, hostel._id, {
      email: "other@test.edu",
      rollNo: "202",
      roomNo: "12",
    });

    const problem = await Problem.create({
      problemTitle: "Broken door",
      problemDescription: "Lock jammed",
      problemImage: "https://example.com/img.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "10",
      category: "Carpentry",
      studentId: student._id,
      status: "ToBeConfirmed",
    });

    const res = await request(app)
      .patch(`/api/problem/${problem._id}/verify`)
      .set("Cookie", [authCookieFor(otherStudent._id)])
      .send({ studentStatus: "Resolved" });

    expect(res.status).toBe(403);
  });
});
