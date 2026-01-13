import express from "express";
import Controllers from "../controllers/index.js";
import Middleware from '../middleware/index.js';

const { VerifyToken } = Middleware;
const { SellerController } = Controllers;

const router = express.Router();

router.use(VerifyToken);
router.post('/apply', SellerController.ApplySeller);
router.get('/me/status', SellerController.SellerStatus)


export default router;