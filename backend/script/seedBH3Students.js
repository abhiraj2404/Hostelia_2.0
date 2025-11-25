import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory (parent folder)
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configuration
const MONGO_URI = process.env.MONGO_URI;
const HOSTEL = 'BH-3';
const STUDENTS_PER_YEAR = 5;
const YEARS = ['UG-1', 'UG-2', 'UG-3', 'UG-4'];

// Sample names
const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Advik', 'Arnav', 'Aryan', 'Ayaan', 'Dhruv',
    'Ishaan', 'Krishna', 'Rudra', 'Shaurya', 'Vihaan', 'Advait', 'Atharva', 'Kabir', 'Kiaan', 'Reyansh'];

const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Rao', 'Nair', 'Iyer',
    'Desai', 'Mehta', 'Joshi', 'Pandey', 'Mishra', 'Shah', 'Agarwal', 'Kapoor', 'Malhotra', 'Chopra'];

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Generate student data
function generateStudents() {
    const students = [];
    let studentIndex = 0;
    let roomNumber = 201; // Starting room number

    for (const year of YEARS) {
        for (let i = 0; i < STUDENTS_PER_YEAR; i++) {
            const firstName = FIRST_NAMES[studentIndex];
            const lastName = LAST_NAMES[studentIndex];
            const name = `${firstName} ${lastName}`;
            const rollNo = (300 + studentIndex).toString(); // 300, 301, 302, etc.
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@iiits.in`;

            students.push({
                name,
                email,
                rollNo,
                hostel: HOSTEL,
                roomNo: roomNumber.toString(),
                year,
                role: 'student',
                password: 'password123', // Will be hashed
            });

            studentIndex++;
            roomNumber++;
        }
    }

    return students;
}

// Create students in database
async function seedStudents() {
    try {
        console.log(`\n🌱 Seeding ${HOSTEL} hostel with students...\n`);

        // Generate student data
        const studentsData = generateStudents();

        // Check for existing students and remove duplicates
        const existingEmails = await User.find({
            email: { $in: studentsData.map(s => s.email) }
        }).select('email');

        const existingEmailSet = new Set(existingEmails.map(u => u.email));
        const newStudents = studentsData.filter(s => !existingEmailSet.has(s.email));

        if (newStudents.length === 0) {
            console.log('⚠️  All students already exist in database');
            return;
        }

        console.log(`📝 Creating ${newStudents.length} new students...`);

        // Hash passwords and create students
        const createdStudents = [];
        for (const studentData of newStudents) {
            const hashedPassword = await bcrypt.hash(studentData.password, 10);
            const student = await User.create({
                ...studentData,
                password: hashedPassword,
            });
            createdStudents.push(student);
        }

        console.log(`\n✅ Successfully created ${createdStudents.length} students!\n`);

        // Display summary
        console.log('📊 Summary:');
        console.log('─'.repeat(80));
        console.log(`Hostel: ${HOSTEL}`);
        console.log(`Total Students: ${createdStudents.length}`);

        const byYear = createdStudents.reduce((acc, s) => {
            acc[s.year] = (acc[s.year] || 0) + 1;
            return acc;
        }, {});

        console.log('\nDistribution by Year:');
        Object.entries(byYear).forEach(([year, count]) => {
            console.log(`  ${year}: ${count} students`);
        });

        console.log('\n📋 Sample Students:');
        console.log('─'.repeat(80));
        createdStudents.slice(0, 5).forEach(s => {
            console.log(`  ${s.name} (${s.year}) - ${s.email} - Room ${s.roomNo}`);
        });
        console.log(`  ... and ${createdStudents.length - 5} more`);

        console.log('\n🔑 Login Credentials:');
        console.log('─'.repeat(80));
        console.log('  Email: any of the emails shown above');
        console.log('  Password: password123');
        console.log('');

    } catch (error) {
        console.error('❌ Error seeding students:', error);
        throw error;
    }
}

// Main function
async function main() {
    try {
        await connectDB();
        await seedStudents();
        console.log('\n✨ Seeding completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run the script
main();
