const jwt = require('jsonwebtoken')
const {error} = require('../utils/responceWrapper');
const User = require('../models/User');
module.exports = async (req,res,next)=>{
    if (!req.headers||
        !req.headers.authorization||
        !req.headers.authorization.startsWith("Bearer")
        ) {
        //return res.status(401).send('Authersion header is required');
        return res.send(error(401,"Authersion header is required"))
    }
    const accessToker = req.headers.authorization.split(" ")[1];
   // console.log(accessToker);
   
    try {
        const decode = jwt.verify(accessToker,process.env.ACCESS_TOKEN);
        console.log(decode,decode._id);

        req._id = decode._id
        const user = await User.findById(req._id);
        if (!user) {
            return res.send(error(404,"User not Found"))
        }else{

            next();
        }
      
    } catch (e) {
        //return res.status(401).send('Invalid Request');
        return res.send(error(401,"Invalid Requggest"))
    }


    
}