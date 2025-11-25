import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { logger } from '../middleware/logger.js';

// Load environment variables
dotenv.config();

// Define the email of the user to remove
const email = 'rohan.d23@iiits.in'; // Replace with the actual email

const removeUserByEmail = async (email) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('Connected to MongoDB for user removal');

        // Find and delete the user
        const deletedUser = await User.findOneAndDelete({ email });

        if (deletedUser) {
            logger.info(`User with email ${email} has been successfully removed`);
            console.log(`✅ User removed successfully:`);
            console.log(`   Name: ${deletedUser.name}`);
            console.log(`   Email: ${deletedUser.email}`);
            console.log(`   Roll No: ${deletedUser.rollNo}`);
            console.log(`   Hostel: ${deletedUser.hostel}`);
            console.log(`   Room: ${deletedUser.roomNo}`);
        } else {
            logger.warn(`No user found with email: ${email}`);
            console.log(`❌ No user found with email: ${email}`);
        }

        // Close the connection
        await mongoose.connection.close();
        logger.info('Database connection closed');

    } catch (error) {
        logger.error('Error removing user:', error);
        console.error('❌ Error removing user:', error.message);
        process.exit(1);
    }
};

// Validate email format (basic check)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format');
    process.exit(1);
}

// Run the removal function
removeUserByEmail(email);