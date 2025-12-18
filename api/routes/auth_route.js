import express from "express";
import Controller from '../controllers/index.js';
import Middleware from "../middleware/index.js";

const { VerifyToken } = Middleware;
const { AuthController, UserController } = Controller;

const router = express.Router();

router.post("/user/register", UserController.UserAuth.register);
router.post("/login", AuthController.login);
router.get('/refresh', AuthController.refresh)
router.use(VerifyToken)
router.post("/logout", AuthController.logout);
router.put('/validate', AuthController.validate);
export default router;
