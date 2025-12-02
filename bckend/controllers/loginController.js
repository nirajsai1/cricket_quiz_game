import jwt from "jsonwebtoken";
import { dataCheck, newUser } from "../services/loginServices.js";
import bcrypt from "bcrypt";
export const register = async(req,res) =>
{
    const {name,userName,password}=req.body;
    if(!name || !userName || !password)
    {
       return res.status(400).send("Fields cannot be empty");
    }
    const userNameCheck=await dataCheck({userName:userName});
    if(userNameCheck)
    {
       return res.status(401).send("UsereName already exists");
    }
    const hashPassword = await bcrypt.hash(password,10);
    if(!hashPassword)
    {
       return res.status(401).send("Password weak");
    }
    const createUser=await newUser({name:name,userName:userName,password:hashPassword});
    res.send("User Registered Successfully");
}
export const login = async(req,res) =>
{
    const {userName,password}=req.body;
    if(!userName || !password)
    {
       return res.status(400).send("Fields cannot be empty");
    }
    const userNameCheck=await dataCheck({userName:userName});
    if(!userNameCheck)
    {
        return res.status(401).send("UsereName doesn't exists");
    }
    const passwordCheck = await bcrypt.compare(password,userNameCheck.password);
    if(!passwordCheck)
    {
        return res.status(401).send("Wrong Password");
    }
    const token = jwt.sign(
        {userName:userName},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRE}
    )
    res.json(
        {
            "msg":"Login successfull",token
        }
    )
}