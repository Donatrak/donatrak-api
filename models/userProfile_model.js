import { Schema, model, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const userProfileSchema = new Schema({
    profilePicture: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    country: {type: String},
    phoneNumber: {type: String},
    professionalActivity: {type: String},
    user: {type: Types.ObjectId, ref: 'User', select: false}
}, {
    timestamps: true
})

userProfileSchema.plugin(toJSON)

export const UserProfileModel = model('UserProfile', userProfileSchema)