import request from "supertest";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { app } from "../index.js";
import Problem from "../models/problem.model.js";
import FeeSubmission from "../models/feeSubmission.model.js";
import Transit from "../models/transit.model.js";
import Feedback from "../models/feedback.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Hostel from "../models/hostel.model.js";
import {
  authCookieFor,
  clearTestDatabase,
  closeTestDatabase,
  connectTestDatabase,
  createTestCollege,
  createTestHostel,
  createTestAdmin,
  createTestStudent,
  createTestWarden,
} from "./testUtils.js";

describe("Hostel API", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  // --- POST /api/hostel/create ---

  it("admin can create a new hostel → 201, hostel returned", async () => {
    const college = await createTestCollege();
    const admin = await createTestAdmin(college._id);

    const res = await request(app)
      .post("/api/hostel/create")
      .set("Cookie", [authCookieFor(admin._id)])
      .send({ name: "C Block" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.hostel.name).toBe("C Block");
  });

  it("rejects hostel with empty name → 400, validation failed", async () => {
    const college = await createTestCollege();
    const admin = await createTestAdmin(college._id);

    const res = await request(app)
      .post("/api/hostel/create")
      .set("Cookie", [authCookieFor(admin._id)])
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects duplicate hostel name in same college → 400", async () => {
    const college = await createTestCollege();
    const admin = await createTestAdmin(college._id);
    await createTestHostel(college._id, { name: "A Block" });

    const res = await request(app)
      .post("/api/hostel/create")
      .set("Cookie", [authCookieFor(admin._id)])
      .send({ name: "A Block" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("student cannot create hostel → 403", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);

    const res = await request(app)
      .post("/api/hostel/create")
      .set("Cookie", [authCookieFor(student._id)])
      .send({ name: "X Block" });

    expect(res.status).toBe(403);
  });

  // --- GET /api/hostel/list ---

  it("admin can list hostels with wardens → 200, array with wardens[]", async () => {
    const college = await createTestCollege();
    const admin = await createTestAdmin(college._id);
    const hostel = await createTestHostel(college._id, { name: "A Block" });
    await createTestWarden(college._id, hostel._id);

    const res = await request(app)
      .get("/api/hostel/list")
      .set("Cookie", [authCookieFor(admin._id)]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.hostels.length).toBe(1);
    expect(res.body.hostels[0].wardens.length).toBe(1);
  });

  it("returns empty wardens array for hostel with no warden assigned", async () => {
    const college = await createTestCollege();
    const admin = await createTestAdmin(college._id);
    await createTestHostel(college._id, { name: "Empty Block" });

    const res = await request(app)
      .get("/api/hostel/list")
      .set("Cookie", [authCookieFor(admin._id)]);

    expect(res.status).toBe(200);
    expect(res.body.hostels[0].wardens).toEqual([]);
  });

  // --- DELETE /api/hostel/:id ---

  it("admin can delete hostel and related hostel data → 200", async () => {
    const college = await createTestCollege();
    const admin = await createTestAdmin(college._id);
    const hostel = await createTestHostel(college._id, { name: "Delete Block" });
    const student = await createTestStudent(college._id, hostel._id, {
      email: "delete.student@test.edu",
      rollNo: "202",
    });
    const warden = await createTestWarden(college._id, hostel._id, {
      email: "delete.warden@test.edu",
    });

    await Problem.create({
      problemTitle: "Broken fan",
      problemDescription: "Fan not working",
      problemImage: "https://example.com/problem.jpg",
      hostelId: hostel._id,
      collegeId: college._id,
      roomNo: "201",
      category: "Electrical",
      studentId: student._id,
    });

    await FeeSubmission.create({
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      collegeId: college._id,
    });

    await Transit.create({
      studentId: student._id,
      collegeId: college._id,
      purpose: "Going to market",
      transitStatus: "EXIT",
      date: new Date(),
      time: "10:30:00",
    });

    await Feedback.create({
      date: new Date(),
      day: "Monday",
      mealType: "Lunch",
      rating: 4,
      comment: "Nice food",
      user: student._id,
      collegeId: college._id,
    });

    await Notification.create({
      userId: student._id,
      collegeId: college._id,
      type: "problem_created",
      title: "Problem Notification",
      message: "A problem was created",
      relatedEntityId: new mongoose.Types.ObjectId(),
      relatedEntityType: "problem",
    });

    const res = await request(app)
      .delete(`/api/hostel/${hostel._id}`)
      .set("Cookie", [authCookieFor(admin._id)]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deleted.hostels).toBe(1);
    expect(res.body.deleted.students).toBe(1);
    expect(res.body.deleted.wardens).toBe(1);
    expect(res.body.deleted.problems).toBe(1);
    expect(res.body.deleted.feeSubmissions).toBe(1);
    expect(res.body.deleted.transits).toBe(1);
    expect(res.body.deleted.feedbacks).toBe(1);
    expect(res.body.deleted.notifications).toBe(1);

    expect(await Hostel.countDocuments({ _id: hostel._id })).toBe(0);
    expect(await User.countDocuments({ _id: { $in: [student._id, warden._id] } })).toBe(0);
    expect(await Problem.countDocuments({ hostelId: hostel._id })).toBe(0);
    expect(await FeeSubmission.countDocuments({ studentId: student._id })).toBe(0);
    expect(await Transit.countDocuments({ studentId: student._id })).toBe(0);
    expect(await Feedback.countDocuments({ user: student._id })).toBe(0);
    expect(await Notification.countDocuments({ userId: student._id })).toBe(0);
  });

  it("student cannot delete hostel → 403", async () => {
    const college = await createTestCollege();
    const hostel = await createTestHostel(college._id);
    const student = await createTestStudent(college._id, hostel._id);

    const res = await request(app)
      .delete(`/api/hostel/${hostel._id}`)
      .set("Cookie", [authCookieFor(student._id)]);

    expect(res.status).toBe(403);
  });

  it("delete hostel returns 404 for unknown hostel", async () => {
    const college = await createTestCollege();
    const admin = await createTestAdmin(college._id);
    const fakeHostelId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/hostel/${fakeHostelId}`)
      .set("Cookie", [authCookieFor(admin._id)]);

    expect(res.status).toBe(404);
  });
});
