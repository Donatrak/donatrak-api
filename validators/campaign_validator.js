import Joi from "joi";


export const createCampaignValidator = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    goalAmount: Joi.number().positive().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    status: Joi.string().valid('active','completed','inactive'),
    image: Joi.string(),
});

export const updateCampaignValidator = Joi.object({
    itle: Joi.string(),
    description: Joi.string(),
    goalAmount: Joi.number().positive(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    status: Joi.string().valid('active','completed','inactive'),
    image:Joi.string()
});
