const { catchAsync } = require("../utils/catchAsync");
const { ApiResponse } = require("../utils/apiResponse");
const db = require("../services/db.service");

const submitSubscription = catchAsync(async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.insertSubscriber({
            email: email.trim().toLowerCase()
        });

        // If insertSubscriber returns null, it means the email already exists
        if (result === null) {
            return res.status(200).json(
                new ApiResponse(200, { email }, "You are already subscribed!")
            );
        }
    } catch (err) {
        console.error("[Subscribe] Database Insert Error:", err.message);
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { email },
            'Successfully subscribed to the newsletter!'
        )
    );
});

module.exports = { submitSubscription };
