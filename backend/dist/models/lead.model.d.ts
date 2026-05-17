import mongoose, { Document } from "mongoose";
export interface ILead extends Document {
    name: string;
    email: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost';
    source: 'website' | 'instagram' | 'referral';
    createdAt: Date;
    createdBy: mongoose.Types.ObjectId;
}
declare const Lead: mongoose.Model<ILead, {}, {}, {}, mongoose.Document<unknown, {}, ILead, {}, mongoose.DefaultSchemaOptions> & ILead & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILead>;
export { Lead };
//# sourceMappingURL=lead.model.d.ts.map