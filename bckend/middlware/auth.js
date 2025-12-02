import jwt from "jsonwebtoken";
export const auth = (req,res,next) =>
{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token)
    {
        res.status(401).send("Invalid Access Token");
    }
    try
    {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch(error)
    {
        console.log(error.message);
    }
}