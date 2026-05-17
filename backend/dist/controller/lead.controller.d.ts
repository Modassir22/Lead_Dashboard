import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
declare const createLead: (req: AuthRequest, res: Response) => Promise<void>;
declare const updateLead: (req: AuthRequest, res: Response) => Promise<void>;
declare const deleteLead: (req: AuthRequest, res: Response) => Promise<void>;
declare const getLead: (req: AuthRequest, res: Response) => Promise<void>;
declare const getAllLeads: (req: AuthRequest, res: Response) => Promise<void>;
export { createLead, updateLead, deleteLead, getLead, getAllLeads };
//# sourceMappingURL=lead.controller.d.ts.map