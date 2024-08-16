import Joi from 'joi';

export const registerValidator = Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string(),
    email: Joi.string().email().required(),
    profession: Joi.string(),
    password: Joi.string().min(8).required(),
    termsAndConditions: Joi.boolean()
});

export const loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const createUserValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'campaignManager')
});

export const updateUserValidator = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    role: Joi.string().valid('user', 'campaignManager')
});


