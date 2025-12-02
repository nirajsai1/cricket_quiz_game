import express from "express";
import { login, register } from "../controllers/loginController.js";
import { auth } from "../middlware/auth.js";
const router2 =express.Router();
router2.post("/login",login);
router2.post("/register",register);
router2.get('/profile',auth,(req,res) =>
{
    res.send("Authorization succesfull");

})
export default router2;