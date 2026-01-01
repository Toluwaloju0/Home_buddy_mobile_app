import express from "express";
import Controller from '../controllers/index.js';
import Middleware from "../middleware/index.js";

const { VerifyToken } = Middleware;
const { AuthController, UserController,SellerController, } = Controller;

const router = express.Router();

// router.post("/register", AuthController.register);
// router.post("/seller/register", SellerController.SellerAuth.register);
router.post("/login", AuthController.login);
router.get('/refresh', AuthController.refresh)
router.use(VerifyToken)
router.post("/logout", AuthController.logout);
router.put('/validate', AuthController.validate);
export default router;
