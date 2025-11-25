import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostelia';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME;

async function addAdmin(email, password, name) {
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email });
    if (existing) {
        console.log('User with this email already exists.');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
        role: 'admin',
        name,
        email,
        password: hashedPassword
    });

    await admin.save();
    console.log('Admin added successfully!');
    mongoose.disconnect();
}

if (!email || !password || !adminName) {
    console.log('Please set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME in your .env file.');
    process.exit(1);
}

addAdmin(email, password, adminName);