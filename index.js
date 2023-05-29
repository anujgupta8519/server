const express = require('express')
const dotenv= require('dotenv')
const dbConnect = require('./dbConnect')
const authRouter = require('./router/authRouter')
const postRouter = require('./router/postRouter')
const userRouter = require('./router/userRouter')
const morgon = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require ('cors')
const cloudinary = require('cloudinary').v2;
dotenv.config('./.env');
const app = express();




// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


//miiddleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(morgon('common'));
app.use(cookieParser())
app.use(cors({
   credentials:true,
   origin:'http://localhost:3000'
}))

app.use('/auth',authRouter)
app.use('/posts',postRouter)
app.use('/user',userRouter)
app.get('/',(req,res)=>{
  res.status(400).send("satted")
})
const PORT = process.env.PORT ||4001
dbConnect();
app.listen(PORT,()=>{
 console.log("started at",PORT);
})
