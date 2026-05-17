import { Router } from "express";
import { login, register } from "../controller/user.controller.js";
const router = Router();
router.route('/signup').post(register);
router.route('/login').post(login);
export default router;
//# sourceMappingURL=user.route.js.map