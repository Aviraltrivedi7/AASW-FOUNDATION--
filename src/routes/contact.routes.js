const express = require("express");
const Joi = require("joi");
const { submitContact } = require("../controllers/contact.controller");
const { validate } = require("../middlewares/validation.middleware");

const router = express.Router();

const contactSchema = Joi.object({
    name: Joi.string().required().min(2).max(100).trim(),
    email: Joi.string().email().required().trim(),
    subject: Joi.string().required().min(3).max(150).trim(),
    message: Joi.string().required().min(10).max(2000).trim(),
    website: Joi.string().allow('').optional(), // Honeypot field — must be empty from real users
});

router.post("/", validate(contactSchema), submitContact);

module.exports = router;
