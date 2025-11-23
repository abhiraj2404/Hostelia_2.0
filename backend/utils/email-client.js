import { Resend } from "resend";

/**
 * Get or create Resend client instance
 * Uses EMAIL_PASS as the Resend API key (Resend API keys start with 're_')
 * Initialized lazily to ensure environment variables are loaded
 */
let resendClient = null;

const getResendClient = () => {
    if (!resendClient) {
        const apiKey = process.env.EMAIL_PASS;
        if (!apiKey) {
            throw new Error("EMAIL_PASS environment variable is not set. Please set it to your Resend API key.");
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
};

/**
 * Send email using Resend
 * @param {Object} mailOptions - Email options (to, subject, html, from, etc.)
 * @param {Object} options - Additional options (debug, etc.) - currently unused but kept for compatibility
 * @returns {Promise} - Result from Resend API (formatted to be compatible with nodemailer response)
 */
export const sendEmail = async (mailOptions, options = {}) => {
    try {
        const resend = getResendClient();
        const { data, error } = await resend.emails.send({
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
        });

        if (error) {
            throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
        }

        // Return data in a format compatible with nodemailer response
        // Controllers expect messageId property
        return {
            messageId: data?.id || data?.messageId,
            ...data,
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get the email user from environment variables
 * Useful for constructing 'from' addresses
 */
export const getEmailUser = () => {
    return process.env.EMAIL_USER;
};

