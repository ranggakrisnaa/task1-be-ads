const Joi = require('joi')

const userSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    username: Joi.string().min(5).required(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
        "string.pattern.base": `The phone number must consist of digits and have a length between 10 and 15 characters.`,
    }),
    email: Joi.string().min(5).required(),
    password: Joi.string().min(8).required()
})

const registerSchema = Joi.object({
    usernameOrEmail: Joi.string().min(5).required(),
    password: Joi.string().min(8).required()
})

const updateUserSchema = Joi.object({
    firstName: Joi.string().min(1),
    lastName: Joi.string().min(1),
    username: Joi.string().min(5),
    email: Joi.string().min(5),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).messages({
        "string.pattern.base": `The phone number must consist of digits and have a length between 10 and 15 characters.`,
    }),
    oldPassword: Joi.string().min(8),
    newPassword: Joi.string().min(8)
})

module.exports = { userSchema, registerSchema, updateUserSchema }