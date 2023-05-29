const Post = require("../models/Post");
const User = require("../models/User");
const { mapPostOutput } = require("../utils/Utils");
const { success, error } = require("../utils/responceWrapper");
const cloudinary = require('cloudinary').v2;

// const getAllPostsController = async (req,res)=>{
//     console.log(req._id);
//     // return res.send('Theses are all post');
//     return res.send(success(200,"done"))
// };
const createPostController = async (req,res)=>{
try {
    const {caption,postImg} = req.body;
    const owner = req._id;
    if (!caption) {
       return  res.send(error(400,"Captions field Required")) 
     }
     if (!postImg) {
        return  res.send(error(400,"Image field Required")) 
     }
    const user = await User.findById(req._id);
    const post = await Post.create({
         owner,
         caption,
    });
    //console.log("done1");
    // user.posts.push(post._id);
await user.posts.push(post._id);
await user.save();
const cloudImg = await cloudinary.uploader.upload(postImg, {
    folder: "PostImg",
});
post.image = {
    url: cloudImg.secure_url,
    publicId: cloudImg.public_id,
};
await post.save();


    // await user.save();
   // console.log("done");
   console.log({post});
    return res.send(success(201,{post}))
    
} catch (e) {
    //console.log(e);
     res.send(error(500,e.message));
}
}

const likeAndUnlikePost = async (req, res)=>{
try {
    const {postId} = req.body;
    const curUserId = req._id;
    const post = await Post.findById(postId).populate('owner');
    if(!post){
        return res.send(error(404,'Psst Not find'));
    }
    if (post.likes.includes(curUserId)) {
        const index = post.likes.indexOf(curUserId);
        post.likes.splice(index,1);
      
    }else{
        post.likes.push(curUserId);
    }
    
        await post.save();
        return res.send(success(200,{post:mapPostOutput(post,req._id)}))
    
} catch (e) {
    res.send(error(500,e.message))
}
};
const updatePostController = async (req,res)=>{
try {
    const {postId,caption} = req.body;
    const currID = req._id;
    if (!postId||!caption) {
        return res.send(error(400,"All field Required")) 
     }
    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404,"post not found"));
    }
    if(post.owner.toString()!== currID){
        return res.send(error(403,"Only owner can update this"));
    }
    if(caption){
        post.caption = caption;
    }
    await post.save();
    return res.send(success(200,{ post }))

  
    
} catch (e) {
    res.send(error(500,e.message))
}



}
const deletePostController = async (req,res)=>{
try {
    const {postId} = req.body;
    const currID = req._id;
    if (!postId) {
       return  res.send(error(400,"Post Id is RequiredRequired")) 
     }
    const post = await Post.findById(postId);
    const user = await User.findById(currID);
    if (!post) {
        return res.send(error(404,"POst Not Found"));
    }
    if(post.owner.toString()!== currID){
        return res.send(error(403,"Only owner can delete this"));
    }
    const index = user.posts.indexOf(postId);
    user.posts.splice(index,1);
    await user.save();
    await Post.findByIdAndDelete(postId)
    return res.send(success(200,"Post DEleted Sucessfully"))
    
} catch (e) {
    return res.send(error(500,e.message))
}
}

module.exports = {
    createPostController,
    likeAndUnlikePost,
    updatePostController,
    deletePostController
};