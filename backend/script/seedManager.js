import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const email = process.env.MANAGER_EMAIL;
const password = process.env.MANAGER_PASSWORD;
const name = process.env.MANAGER_NAME;

async function seedManager() {
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email });
    if (existing) {
        console.log('Manager user already exists with this email.');
        await mongoose.disconnect();
        process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = new User({
        role: 'manager',
        name,
        email,
        password: hashedPassword,
        // No collegeId — managers are platform-level
    });

    await manager.save();
    console.log('Manager user created successfully!');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    await mongoose.disconnect();
}

seedManager().catch((err) => {
    console.error('Failed to seed manager:', err.message);
    process.exit(1);
});
