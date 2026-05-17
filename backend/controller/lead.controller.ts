import type { Response } from "express";
import { Lead } from "../models/lead.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, email, status, source } = req.body;
    const userId = req.user?.id || req.user?._id;
    
    if (!name || !email || !status || !source) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }

    try {
        const leadExist = await Lead.findOne({ email });
        if (leadExist) {
            res.status(400).json({ message: "Lead already exists" });
            return;
        }

        const lead = new Lead({
            name,
            email,
            status,
            source,
            createdBy: userId
        });

        await lead.save();
        res.status(200).json({ message: "lead Created Successfully" });
    } catch (e) {
        res.status(500).json({ message: "Error while creating Lead" });
    }
};

const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, email, status, source } = req.body;
    
    if (!name || !email || !status || !source) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }

    try {
        const lead = await Lead.findById(id);
        if (!lead) {
            res.status(404).json({ message: "Lead doesn't exist" });
            return;
        }

        if (req.user && req.user.role !== 'admin') {
            const userId = (req.user.id || req.user._id).toString();
            if (!lead.createdBy || lead.createdBy.toString() !== userId) {
                res.status(403).json({ message: "Forbidden - You can only update your own leads" });
                return;
            }
        }

        const updatedLead = await Lead.findByIdAndUpdate(
            id,
            {
                name,
                email,
                status,
                source
            }
        );
        res.status(200).json({ message: "Lead updated successfully" });
    } catch (e) {
        res.status(500).json({ message: "Error while updating Lead" });
    }
};

const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const lead = await Lead.findById(id);
        if (!lead) {
            res.status(404).json({ message: "Lead doesn't exist" });
            return;
        }

        await Lead.findByIdAndDelete(id);
        res.status(200).json({ message: "Lead Deleted Successfully" });
    } catch (e) {
        res.status(500).json({ message: "Error While Deleting Lead" });
    }
};

const getLead = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const lead = await Lead.findById(id);
        if (!lead) {
            res.status(404).json({ message: "Lead doesn't exists" });
            return;
        }
        
        if (req.user && req.user.role !== 'admin') {
            const userId = (req.user.id || req.user._id).toString();
            if (!lead.createdBy || lead.createdBy.toString() !== userId) {
                res.status(403).json({ message: "Forbidden - You can only view your own leads" });
                return;
            }
        }
        
        res.status(200).json({ message: "Lead Found SuccessFully", lead });
    } catch (e) {
        res.status(500).json({ message: "Error while fetching lead" });
    }
};

const getAllLeads = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { search, status, source, sort, exportData } = req.query;

        let query: any = {};

        if (req.user && req.user.role !== 'admin') {
            const userId = req.user.id || req.user._id;
            query.createdBy = userId;
        }

        if (status) {
            query.status = status;
        }

        if (source) {
            query.source = source;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption: any = { createdAt: -1 }; // default latest
        if (sort) {
            if (sort === 'oldest') {
                sortOption = { createdAt: 1 };
            } else if (sort === 'latest') {
                sortOption = { createdAt: -1 };
            } else {
                const [field, order] = (sort as string).split('_');
                if (field && order) {
                    sortOption = {};
                    sortOption[field] = order === 'asc' ? 1 : -1;
                }
            }
        }

        if (exportData === 'true') {
            const allLeads = await Lead.find(query).sort(sortOption);
            res.status(200).json({ message: "Leads for export", leads: allLeads });
            return;
        }

        const leads = await Lead.find(query).sort(sortOption).skip(skip).limit(limit);
        const totalLeads = await Lead.countDocuments(query);
        const totalPages = Math.ceil(totalLeads / limit);

        res.status(200).json({ 
            message: "Lead Found SuccessFully", 
            leads,
            metadata: {
                totalLeads,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (e) {
        res.status(400).json({ message: "Error while fetching all leads" });
    }
};

export { createLead, updateLead, deleteLead, getLead, getAllLeads };
