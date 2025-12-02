import { userModel } from "../models/userModel.js";
export const findById = async(data) =>
{
    const result= await userModel.findOne(data);
    return result;
}