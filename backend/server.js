const express=require("express");
const cors=require("cors");
const { default: mongoose } = require("mongoose");
const app=express();
app.use(cors());
app.use(express.json());
mongoose.connect("mongodb://localhost:27017/names");
const mschema = mongoose.Schema({
    player : String,
    country : String
});
const model=mongoose.model("countrywise",mschema);
app.post('/get_details',(req,res) =>
{
    const {country,alphabet,pname}=req.body;
    console.log(req.body);
    model.findOne({player : pname})
    .then((user) =>
    {
        if(user)
        {
            if(user.country===country&& user.player[0]===alphabet)
            {
                res.json("success");
            }
            else
            {
                res.json("partal");
            }
        }
        else
        {
            res.json("failure");
        }
    })
    .catch(err =>res.json(err));
})
app.get("/",(req,res) =>
{
    console.log("backend working");
})
app.listen(5000,() =>
{
    console.log("hii");
})