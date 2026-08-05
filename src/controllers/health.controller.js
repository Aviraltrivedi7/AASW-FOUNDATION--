const { catchAsync } = require("../utils/catchAsync");
const { ApiResponse } = require("../utils/apiResponse");

const checkHealth = catchAsync(async (req, res) => {
    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    };

    const uptime = process.uptime();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                status: "active",
                timestamp: new Date().toISOString(),
                uptime_seconds: uptime,
                uptime_human: formatUptime(uptime)
            },
            "AASW Foundation API is running smoothly."
        )
    );
});

module.exports = { checkHealth };
