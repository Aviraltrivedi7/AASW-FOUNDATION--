const { ApiError } = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
    console.error("[Global Error Handler] Caught error:", err.stack || err);
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode).json(response);
};

module.exports = { errorHandler };
