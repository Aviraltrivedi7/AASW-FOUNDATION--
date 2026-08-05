// Wrapper for async route handlers to pass errors to global error handler
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
};

module.exports = { catchAsync };
