import z from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { logger } from "../middleware/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

/**
 * Generate JWT token and set cookie
 */
export const generateToken = (userID, res) => {
    const token = jwt.sign({ userID }, JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
};

/**
 * Zod schemas for validation
 */
const emailSchema = z.email().refine(
    (email) => email.endsWith("@iiits.in"),
    { message: "Email must be a valid @iiits.in address." }
);

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .refine(
            name => name.trim() !== "",
            { message: "Name cannot be blank or only spaces" }
        )
        .regex(/^[A-Za-z\s]+$/, "Name must only contain letters and spaces (no numbers or special characters)"),
    rollNo: z.string().regex(/^[0-9]{3}$/, "Roll number must be exactly 3 digits"),
    email: emailSchema,
    hostel: z.enum([ "BH-1", "BH-2", "BH-3", "BH-4" ], {
        errorMap: () => ({ message: "Invalid hostel selection" }),
    }),
    roomNo: z.string().min(1, "Room number is required"),
    year: z.enum([ "UG-1", "UG-2", "UG-3", "UG-4" ], {
        errorMap: () => ({ message: "Invalid year selection" }),
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const generateOTPSchema = z.object({
    email: emailSchema,
    name: z.string()
});

const verifyOTPSchema = z.object({
    email: emailSchema,
    otp: z.string().length(6, "OTP must be 6 digits"),
    userData: z.object({
        name: z.string().min(1),
        rollNo: z.string().regex(/^[0-9]{3}$/),
        hostel: z.enum([ "BH-1", "BH-2", "BH-3", "BH-4" ]),
        roomNo: z.string().min(1),
        year: z.enum([ "UG-1", "UG-2", "UG-3", "UG-4" ]),
        password: z.string().min(6),
    }).optional(),
});

/**
 * Generate OTP for email verification
 */
export const generateOTP = async (req, res) => {
    try {
        // Validate input
        const validationResult = generateOTPSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const { email, name } = validationResult.data;

        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database (replace existing if any)
        await OTP.findOneAndDelete({ email });
        await OTP.create({ email, otp });

        // Set up email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: parseInt(process.env.EMAIL_PORT || "587"),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        // Email content
        const mailOptions = {
            from: `"Hostelia - IIIT Sri City" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Email Verification OTP for Hostelia",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <h2 style="color: #4f46e5;">Hostelia - Email Verification</h2>
          <p>Hello ${name},</p>
          <p>Your One-Time Password (OTP) for email verification is:</p>
          <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
          <p>Best regards,<br>Hostelia Team</p>
        </div>
      `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email address",
        });
    } catch (error) {
        logger.error("Error generating OTP:", error);
        return res.status(500).json({
            success: false,
            message: "Error generating OTP",
            error: error.message,
        });
    }
};

/**
 * Verify OTP and create user account if userData is provided
 */
export const verifyOTP = async (req, res) => {
    try {
        // Validate input
        const validationResult = verifyOTPSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const { email, otp, userData } = validationResult.data;

        // Find the OTP record
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found. Please request a new one.",
            });
        }

        // Check if OTP matches
        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again.",
            });
        }

        // OTP is valid - delete it after verification
        await OTP.findOneAndDelete({ email });

        // If userData is provided, create the user account
        if (userData) {
            const { name, rollNo, hostel, roomNo, year, password } = userData;

            // Check for existing user
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email",
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const newUser = await User.create({
                name,
                rollNo,
                email,
                hostel,
                roomNo,
                year,
                password: hashedPassword,
                role: "student",
            });

            // Generate token and set cookies
            generateToken(newUser._id, res);
            res.cookie("userid", newUser._id.toString());
            res.cookie("role", newUser.role);

            return res.status(200).json({
                success: true,
                message: "Email verified and account created successfully",
                verified: true,
                user: {
                    userId: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            verified: true,
        });
    } catch (error) {
        logger.error("Error verifying OTP:", error);
        return res.status(500).json({
            success: false,
            message: "Error verifying OTP",
            error: error.message,
        });
    }
};

/**
 * User signup (after email verification)
 */
export const signup = async (req, res) => {
    try {
        // Validate input
        const validationResult = signupSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error)
            });
        }

        const { name, rollNo, email, hostel, roomNo, year, password } = validationResult.data;

        // Check if email is verified (OTP should have been deleted after verification)
        const otpRecord = await OTP.findOne({ email });
        if (otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email before signing up.",
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            name,
            rollNo,
            email,
            hostel,
            roomNo,
            year,
            password: hashedPassword,
            role: "student",
        });

        // Generate token and set cookies
        generateToken(newUser._id, res);
        res.cookie("userid", newUser._id.toString());
        res.cookie("role", newUser.role);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                userId: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                rollNo: newUser.rollNo
            },
        });
    } catch (error) {
        logger.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message,
        });
    }
};

/**
 * User login
 */
export const login = async (req, res) => {
    try {
        // Validate input
        const validationResult = loginSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: z.treeifyError(validationResult.error),
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
            });
        }

        // Generate token and set cookies
        generateToken(user._id, res);
        res.cookie("role", user.role);
        res.cookie("userid", user._id.toString());

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                userId: user._id,
                name: user.name,
                rollNo: user.rollNo,
                email: user.email,
                hostel: user.hostel,
                roomNo: user.roomNo,
                year: user.year,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error("ERROR in login controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

/**
 * User logout
 */
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.cookie("role", "", { maxAge: 0 });
        res.cookie("userid", "", { maxAge: 0 });
        res.clearCookie("jwt");
        res.clearCookie("role");
        res.clearCookie("userid");

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        logger.error("ERROR in logout controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
