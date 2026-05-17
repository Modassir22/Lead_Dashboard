import { Router } from "express";
import { createLead, updateLead, deleteLead, getLead, getAllLeads } from "../controller/lead.controller.js";
import { authenticateJWT, authorizeAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authenticateJWT middleware to all routes
router.use(authenticateJWT);

router.route('/create-lead').post(createLead);
router.route('/update-lead/:id').post(updateLead);
router.route('/delete-lead/:id').post(authorizeAdmin, deleteLead);
router.route('/get-single-lead/:id').get(getLead);
router.route('/get-all-lead').get(getAllLeads);

export default router;
