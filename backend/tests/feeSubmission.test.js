import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { app } from "../index.js";
import FeeSubmission from "../models/feeSubmission.model.js";
import {
  authCookieFor,
  clearTestDatabase,
  closeTestDatabase,
  connectTestDatabase,
  createTestCollege,
  createTestHostel,
  createTestStudent,
  createTestAdmin,
  createTestWarden,
} from "./testUtils.js";

describe("Fee Submission API", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  async function seedFeeRecord(studentId, collegeId) {
    return FeeSubmission.create({
      studentId,
      studentName: "Test Student",
      studentEmail: "student@test.edu",
      collegeId,
      hostelFee: { status: "documentNotSubmitted" },
      messFee: { status: "documentNotSubmitted" },
    });
  }

  it("student can get their own fee status", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    await seedFeeRecord(student._id, college._id);

    const res = await request(app)
      .get("/api/fee")
      .set("Cookie", [authCookieFor(student._id)]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].hostelFee.status).toBe("documentNotSubmitted");
  });

  it("admin can get all fee statuses for the college", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const admin = await createTestAdmin(college._id);
    const student1 = await createTestStudent(college._id, hostel._id);
    const student2 = await createTestStudent(college._id, hostel._id, {
      email: "student2@test.edu",
      rollNo: "202",
      roomNo: "11",
    });

    await seedFeeRecord(student1._id, college._id);
    await seedFeeRecord(student2._id, college._id);

    const res = await request(app)
      .get("/api/fee")
      .set("Cookie", [authCookieFor(admin._id)]);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it("hostel fee submission without file returns 400", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    await seedFeeRecord(student._id, college._id);

    const res = await request(app)
      .post("/api/fee/hostel")
      .set("Cookie", [authCookieFor(student._id)]);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/document is required/i);
  });

  it("mess fee submission without file returns 400", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    await seedFeeRecord(student._id, college._id);

    const res = await request(app)
      .post("/api/fee/mess")
      .set("Cookie", [authCookieFor(student._id)]);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/document is required/i);
  });

  it("warden cannot submit hostel fee (403)", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const warden = await createTestWarden(college._id, hostel._id);

    const res = await request(app)
      .post("/api/fee/hostel")
      .set("Cookie", [authCookieFor(warden._id)]);

    expect(res.status).toBe(403);
  });

  it("admin can update fee status for a student", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const admin = await createTestAdmin(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    await seedFeeRecord(student._id, college._id);

    const res = await request(app)
      .patch(`/api/fee/${student._id}/status`)
      .set("Cookie", [authCookieFor(admin._id)])
      .send({ hostelFeeStatus: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hostelFee.status).toBe("approved");
  });

  it("rejects fee status update with no fields provided", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const admin = await createTestAdmin(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    await seedFeeRecord(student._id, college._id);

    const res = await request(app)
      .patch(`/api/fee/${student._id}/status`)
      .set("Cookie", [authCookieFor(admin._id)])
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 when updating fee status for unknown student", async () => {
    const college = await createTestCollege();
    const admin = await createTestAdmin(college._id);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/fee/${fakeId}/status`)
      .set("Cookie", [authCookieFor(admin._id)])
      .send({ hostelFeeStatus: "approved" });

    expect(res.status).toBe(404);
  });

  it("student cannot update fee status (403)", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);
    const otherStudent = await createTestStudent(college._id, hostel._id, {
      email: "other@test.edu",
      rollNo: "202",
      roomNo: "11",
    });
    await seedFeeRecord(otherStudent._id, college._id);

    const res = await request(app)
      .patch(`/api/fee/${otherStudent._id}/status`)
      .set("Cookie", [authCookieFor(student._id)])
      .send({ hostelFeeStatus: "approved" });

    expect(res.status).toBe(403);
  });
});
