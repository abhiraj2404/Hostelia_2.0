import { logger } from './logger.js';

/**
 * Wrapper middleware to handle multer errors properly
 * Multer errors from fileFilter need special handling
 */
export function handleMulterError(multerMiddleware) {
    return (req, res, next) => {
        multerMiddleware(req, res, (err) => {
            if (err) {
                // Multer file filter errors (from fileFilter callback)
                if (err.message && (
                    err.message.includes('format allowed') ||
                    err.message.includes('file type') ||
                    err.message.includes('Unsupported file type') ||
                    err.message.includes('Only .png, .jpg and .jpeg')
                )) {
                    logger.warn('File upload rejected - invalid file type', {
                        error: err.message,
                    });
                    // Return the actual error message from the filter
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                }

                // Multer file size errors
                if (err.code === 'LIMIT_FILE_SIZE') {
                    logger.warn('File upload rejected - file too large', {
                        error: err.message,
                    });
                    return res.status(400).json({
                        success: false,
                        message: 'File size exceeds the maximum limit of 10MB. Please upload a smaller file.',
                    });
                }

                // Other multer errors
                if (err.name === 'MulterError') {
                    logger.warn('Multer error', { error: err.message, code: err.code });
                    return res.status(400).json({
                        success: false,
                        message: err.message || 'File upload error occurred.',
                    });
                }

                // Pass other errors to next error handler
                logger.error('Unexpected error in multer error handler', { error: err.message });
                return next(err);
            }
            next();
        });
    };
}

