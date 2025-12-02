import mongoose from "mongoose"
const userSchema = new mongoose.Schema(
    {
        name:{type:String,required:true},
        userName : {type:String,required:true,unique:true},
        password:{type:String,required:true}
    }
)
export const loginModels = mongoose.model("userData",userSchema);