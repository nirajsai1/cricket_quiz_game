import { loginModels } from "../models/loginModel.js";
export const dataCheck = async(data) =>
{
    return await  loginModels.findOne(data);
}
export const newUser = async(data) =>
{
    return await loginModels.create(data);
}