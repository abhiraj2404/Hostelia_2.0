import { logger } from "./logger.js";
import College from "../models/college.model.js";

/**
 * Middleware: Validates that the provided email matches the emailDomain
 * of the specified collegeId.
 */
export const domainValidation = async (req, res, next) => {
    try {
        const { email, collegeId } = req.body;

        if (!email || !collegeId) {
            return res.status(400).json({
                success: false,
                message: "Email and collegeId are required.",
            });
        }

        // Fetch the college
        const college = await College.findById(collegeId);
        if (!college) {
            return res.status(404).json({
                success: false,
                message: "College not found.",
            });
        }

        // Extract domain from email
        const domainMatch = email.match(/(@.+)$/);
        if (!domainMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
            });
        }
        const emailDomain = domainMatch[ 1 ].toLowerCase();

        // Check if the domain matches the college's domain
        if (emailDomain !== college.emailDomain) {
            return res.status(403).json({
                success: false,
                message: `Your email domain (${emailDomain}) does not match the registered domain for ${college.name} (${college.emailDomain}).`,
            });
        }

        // Attach college to request for downstream usage
        req.college = college;

        // Block signup/OTP for unapproved colleges (legacy colleges without status are okay)
        if (college.status && college.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: "This college's registration is pending approval. Student registration is not yet available.",
            });
        }

        next();
    } catch (error) {
        logger.error("Error in domainValidation middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error during domain validation.",
        });
    }
};
