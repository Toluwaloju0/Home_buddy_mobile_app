import express from "express";
import UserController from "../controllers/User/index.js";
import Middleware from '../middleware/index.js';

const { VerifyToken } = Middleware;
const router = express.Router();

router.use(VerifyToken);
router.get("/me", UserController.getMe);
router.put("/me/update", UserController.UpdateMe);
router.delete("/me/delete", UserController.DeleteMe);

export default router;
