import nodemailer from "nodemailer";

/**
 * Create and configure email transporter
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.resend.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: "resend",
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Send email using the configured transporter
 * @param {Object} mailOptions - Email options (to, subject, html, from, etc.)
 * @param {Object} options - Additional options (debug, etc.)
 * @returns {Promise} - Result from nodemailer sendMail
 */
export const sendEmail = async (mailOptions, options = {}) => {
    const transporter = createTransporter();

    // Add debug option if specified
    if (options.debug) {
        transporter.options.debug = true;
    }

    return await transporter.sendMail(mailOptions);
};

/**
 * Get the email user from environment variables
 * Useful for constructing 'from' addresses
 */
export const getEmailUser = () => {
    return process.env.EMAIL_USER;
};

