const { ApiError } = require("../utils/apiError");

const validate = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return next(new ApiError(400, "Validation Error", errorMessages));
    }

    req.body = value; // Replace body with sanitized/validated data
    return next();
};

module.exports = { validate };
