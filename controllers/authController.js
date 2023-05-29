const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error, success } = require('../utils/responceWrapper');

const signupController = async(req,res)=>{
    try {
        const {email,password,name} = req.body;
        if (!email||!password||!name) {
            //return res.status(400).send("All Fields are required");
            return res.send(error(400,"All Fields are required"))
        }
        const oldUser =  await User.findOne({email})
        if (oldUser) {
          //  return res.status(409).send("user is Already Registerd");
            return res.send(error(409,"user is Already Registerd"))

        }
        const hashPassword = await bcrypt.hash(password,10);
        const user = await User.create({
            name,
            email,
            password:hashPassword
        });
        // return res.status(201).json({
        //     user,
        // });
        return res.send(success(201,`User Created for ${user.name} with userId ${user._id}`))

    } catch (e) {
        //console.log(e);
        //res.status(505).send("some error")
        return res.send(error(505,e.message))
        
    }
}
const loginController = async(req,res)=>{
    try {
        const {email,password} = req.body;
        if (!email||!password) {
          //  return res.status(400).send("All Fields are required");
          return res.send(error(400,"All Fields are required"))
        }
        const user =  await User.findOne({email}).select('+password')
        if (!user) {
            //return res.status(409).send("user is not  Registerd");
            return res.send(error(409,"user is not  Registerd"))

        }
        const matched = await bcrypt.compare(password,user.password)
        if (!matched) {
            //return res.status(403).send("Incorrect Password");
            return res.send(error(403,"Incorrect Password"))

        }
        const accessToken = genrateAcessToken({_id : user._id});
        const refreshToken = genraterefershToken({_id : user._id})
        res.cookie('jwt',refreshToken,{
            httpOnly:true,
            secure:true
        })
        // return res.json({accessToken});
        return res.send(success(201,{
            accessToken
        }))
        
    }catch (e) {
            //console.log(e);
            //res.status(505).send("some error")
            return res.send(error(505,e.message))
            
        }
}
   //genrate new access Token
   const refreshToken = async (req,res)=>{
    const cookies = req.cookies;

    if(!cookies.jwt){
       // return res.status(401).send("Rrfresh token in cookies is required");
       return res.send(error(401,"Rrfresh token in cookies is required"))
    }
        const refreshToken= cookies.jwt;

        try {
            const decode = jwt.verify(refreshToken,process.env.REFERSH_TOKEN);
          const _id = decode._id;
         const accessToken = genrateAcessToken({_id});
    //  res.status(201).json({accessToken})
    return res.send(success(201,{
        accessToken
    }))
                    
        } catch (e) 
        {
           // console.log(e);
           // return res.status(401).send('Invalid Refresh Token');
           return res.send(error(401,e.message))
        }
   }


   const logOutController = async(req,res)=>{
    try {
        
        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true
        })
        return res.send(success(200,"LogOut SucessFully"))
    } catch (e) {
        return res.send(error(500,e.message))
    }
   }




//internal function
const genrateAcessToken=(data)=>{
try {
    const token= jwt.sign(data,process.env.ACCESS_TOKEN,{
        expiresIn:'15d'
    });
   // console.log(token);
    return token;
} catch (e) {
   // console.log(e);
}
}
const genraterefershToken=(data)=>{
    try {
        const token= jwt.sign(data,process.env.REFERSH_TOKEN,{
            expiresIn:'1y'
        });
        console.log(token);
        return token;
    } catch (e) {
        //console.log(e);
    }
    }

 

module.exports = {
    signupController,
    loginController,
    refreshToken,
    logOutController
};
//30:00 