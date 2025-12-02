import express from "express";
import { findById } from "../services/userService.js";
import { userModel } from "../models/userModel.js";
export const getPlayer = async(req,res) =>
{
    const {id}=req.body;
    try
    {
        const dataGetter = await findById({ID:id});
        console.log(dataGetter);
        res.json(dataGetter);
    }
    catch(err)
    {
        console.log(err.message);
    }
}
export const getNames = async(req,res) =>
{
    try {
        const users = await userModel.find({}, "NAME"); 
        res.json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
}
export const getBowlingTypes = async(req,res) =>
{
    try
    {
        const bt =await userModel.distinct("BAT TYPE");
        
    }
    catch(err)
    {
        console.log(err.message);
    }
}