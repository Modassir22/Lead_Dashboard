import mongoose, { Schema, Document } from "mongoose";
const leadSchema = new Schema({
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
const Lead = mongoose.model("Lead", leadSchema);
export { Lead };
//# sourceMappingURL=lead.model.js.map