const express = require("express");
const Joi = require("joi");
const { submitSubscription } = require("../controllers/subscriber.controller");
const { validate } = require("../middlewares/validation.middleware");

const router = express.Router();

const subscribeSchema = Joi.object({
    email: Joi.string().email().required().trim()
});

router.post("/", validate(subscribeSchema), submitSubscription);

module.exports = router;
