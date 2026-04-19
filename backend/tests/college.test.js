import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { app } from "../index.js";
import College from "../models/college.model.js";
import {
  clearTestDatabase,
  closeTestDatabase,
  connectTestDatabase,
} from "./testUtils.js";

describe("College API", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("registers college successfully", async () => {
    const res = await request(app).post("/api/college/register").send({
      collegeName: "New College",
      emailDomain: "@newcollege.edu",
      adminEmail: "admin@newcollege.edu",
      hostels: ["H1"],
      messes: ["M1"],
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.college.name).toBe("New College");
  });

  it("returns approved college list", async () => {
    await College.create({
      name: "Approved",
      emailDomain: "@approved.edu",
      adminEmail: "admin@approved.edu",
      status: "approved",
    });

    const res = await request(app).get("/api/college/list");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.colleges.length).toBe(1);
  });
});
