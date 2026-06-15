/**
 * Centralized global error handling middleware.
 * Prevents system stack traces and source details from leaking to clients.
 */
const errorHandler = (err, req, res, next) => {
    // Log stack trace locally for developers/operators
    console.error(`[ERROR] [${req.method}] ${req.originalUrl}:`, err);

    // Determine status code
    const statusCode = err.status || err.statusCode || 500;
    const isProd = process.env.NODE_ENV === 'production';

    const errorResponse = {
        success: false,
        message: statusCode === 500 && isProd
            ? 'A secure server error occurred. Please contact support.'
            : err.message || 'Internal Server Error'
    };

    // Expose stack trace only in non-production environments
    if (!isProd) {
        errorResponse.stack = err.stack;
    }

    return res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
