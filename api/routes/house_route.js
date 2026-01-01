import { Router } from "express";
// import multer from 'multer';
import Controllers from '../controllers/index.js';
import Middlewares from '../middleware/index.js';

import upload from "../utils/upload.js";
const router = Router();

router.use(Middlewares.VerifyToken)
router.get("/", Controllers.HouseController.getHouses);
// router.get('/:seller_id', Controllers.HouseController.getHouses);
router.post('/add', upload.array('photos', 12), Controllers.HouseController.addHouses);

export default router;