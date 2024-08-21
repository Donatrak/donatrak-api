
import {Types, Schema, model} from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";



const campaignSchema = new Schema ({
    title: {type:String, required: true,},
    description: {type: String, required:true},
    goalAmount: {type: Number, required: true},
    currentAmount: {type: Number, default:0},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required:true},
    createdBy: {type: Types.ObjectId, ref: 'User', required: true},
    status: {type: String, enum:['active','completed', 'inactive'], default: 'inactive'},
    image: { type: String }
}, {
    timestamps: true
});


campaignSchema.plugin(toJSON);

export const campaignModel = model ('Campaign', campaignSchema);