import Joi from 'joi'

export const userProfileValidator = Joi.object({
    profilePicture: Joi.string(),
    fullname: Joi.string(),
    country: Joi.string(),
    phoneNumber: Joi.string(),
    professionalActivity: Joi.string(),
    user: Joi.string()
})

export const passwordUpdateValidator = Joi.object({
    email: Joi.string(),
    currentPassword: Joi.string(),
    newPassword: Joi.string()
})
