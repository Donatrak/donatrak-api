import { Schema, model } from "mongoose";
import {toJSON} from "@reis/mongoose-to-json";

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: String, enum: ['user', 'campaignManager'], default: 'user' }
}, {
    timestamps: true
});

userSchema.plugin(toJSON);
export const User = model('User', userSchema);