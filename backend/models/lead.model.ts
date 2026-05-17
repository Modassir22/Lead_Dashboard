import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
    name: string;
    email: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost';
    source: 'website' | 'instagram' | 'referral';
    createdAt: Date;
}

const leadSchema = new Schema<ILead>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'lost'],
        default: 'new'
    },
    source: {
        type: String,
        enum: ['website', 'instagram', 'referral']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Lead = mongoose.model<ILead>("Lead", leadSchema);

export { Lead };
