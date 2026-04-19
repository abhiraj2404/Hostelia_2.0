import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export async function connectTestDatabase() {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

export async function clearTestDatabase() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function closeTestDatabase() {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export function authCookieFor(userId) {
  const token = jwt.sign({ userID: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return `jwt=${token}`;
}
