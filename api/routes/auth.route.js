import express from "express";
import AuthController from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.use(verifyToken);   // use the token to authenticate the user
router.post("/logout", AuthController.logout);

export default router;
