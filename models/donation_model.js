import { toJSON } from "@reis/mongoose-to-json";
import {model, Types, Schema} from "mongoose";


const donationSchema = new Schema ({
    donor: {type: Types.ObjectId, ref: 'User', required: true},
    campaign: {type: Types.ObjectId, ref: 'Campaign', required: true},
    amount: {type: Number, required: true},
    donationDate: {type: Date, default: Date.now},
    status: {type: String, enum: ['pending', 'completed','failed'],default: 'pending'},
    message: {type: String}, //optional for any reference or message
    reference: String,  // Add field for payment reference
    transactionId: String  // Add field for transaction ID
},{
    timestamps: true,
});

donationSchema.plugin(toJSON);

export const donationModel = model('Donation', donationSchema);