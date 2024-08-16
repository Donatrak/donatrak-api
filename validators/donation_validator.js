import Joi from "joi";

export const createDonationValidator = Joi.object({
    donor: Joi.string().required(),
    campaign: Joi.string().required(),
    amount: Joi.number().positive().required(),
    status: Joi.string().valid('pending','completed','failed'),
    message: Joi.string()
});

export const updateDonationValidator = Joi.object({
    amount: Joi.number().positive(),
    status: Joi.string().valid('pending', 'completed','failed'),
    message: Joi.string(),
});