import express from "express";
import { getBowlingTypes, getNames, getPlayer } from "../controllers/userController.js";
import { userModel } from "../models/userModel.js";
const router1 =express.Router();
router1.post('/data',getPlayer);
router1.get('/names',getNames);
router1.get('/bt',getBowlingTypes);
export default router1