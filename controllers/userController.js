//const { model } = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const { mapPostOutput } = require("../utils/Utils");
const { error, success } = require("../utils/responceWrapper");
const cloudinary = require('cloudinary').v2;
const followOrUnfollowUserController = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const curUserId = req._id;
        if (!userIdToFollow) {
           return  res.send(error(400,"userIdToFollow field Required")) 
         }

        const userToFollow = await User.findById(userIdToFollow);
        const curUser = await User.findById(curUserId);

        if (curUserId === userIdToFollow) {
            return res.send(error(409, "Users cannot follow themselves"));
        }

        if (!userToFollow) {
            return res.send(error(404, "User to follow not found"));
        }

        if (curUser.following.includes(userIdToFollow)) {
            // already followed
            const followingIndex = curUser.following.indexOf(userIdToFollow);
            curUser.following.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(curUser);
            userToFollow.followers.splice(followerIndex, 1);
        } else {
            userToFollow.followers.push(curUserId);
            curUser.following.push(userIdToFollow);
        }

        await userToFollow.save();
        await curUser.save();

        return res.send(success(200, {user: userToFollow}))
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
};

const getPostOfFollowing = async (req, res)=>{
try {
    const curUserId = req._id;
    const currUser = await User.findById(curUserId).populate('following');
    const fullPosts = await Post.find().populate('owner');
    // {
    //     'owner': {
    //         $in:currUser.following
    //     }
    // }
    const posts = fullPosts
    .map((item) => mapPostOutput(item, req._id))
    .reverse();
    
    const followings = currUser.following.map(item=>item._id);
    const suggestion = await User.find({
        _id:{
            $nin:followings
        }
    })

    return res.send(success(200,{...currUser._doc,suggestion,posts}))
    
} catch (e) {
    console.log(e);
     res.send(error(500,e.message))
}


}
const getMyPosts = async (req,res) =>{
    try {
        const curUserId = req._id;
            const allUserPosts = await Post.find({
                'owner': curUserId
    
        }).populate('likes');
            return res.send(success(200,allUserPosts))

        

        
    } catch (e) {
        console.log(e);
         res.send(error(500,e.message))
    }

}

const getUserPosts = async (req,res) =>{
    try {
        const {userId} = req.body;
        if (!userId) {
           return res.send(error(400,"User Id is Required")) 
        }
        const allUserPosts = await Post.find({
            'owner': userId

    }).populate('likes');
        return res.send(success(200,allUserPosts))
        
    } catch (e) {
        //console.log(e);
        return  res.send(error(500,e.message))
    }

}


const deleteUser = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        // delete all posts
        await Post.deleteMany({
            owner: curUserId,
        });

        // removed myself from followers' followings
        curUser?.followers?.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.following.indexOf(curUserId);
            follower.following.splice(index, 1);
            await follower.save();
        });

        // remove myself from my followings' followers
        curUser.following?.forEach(async (followingId) => {
            const following1 = await User.findById(followingId);
            const index = following1.followers.indexOf(curUserId);
            following1.followers.splice(index, 1);
            await following.save();
        });

        // remove myself from all likes
        const allPosts = await Post.find();
        allPosts?.forEach(async (post) => {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();
        });

        // delete user
        await User.findByIdAndDelete(curUserId);

        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
        });

        return res.send(success(200, "user deleted"));
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
};

const getMyInfo = async (req, res) => {
    try {
        const user = await User.findById(req._id);
        //console.log("hello",user);
        return res.send(success(200, { user }));

    } catch (e) {
        return res.send(error(500, e.message));
    }
};
const updateUserProfile = async (req, res) => {
    try {
        const { name, bio, userImg } = req.body;

        const user = await User.findById(req._id);

        if (name) {
            user.name = name;
        }
        if (bio) {
            user.bio = bio;
        }
        if (userImg) {
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: "ProfilrImg",
            });
            user.avater = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id,
            };
        }
        await user.save();
        return res.send(success(200, { user }));
    } catch (e) {
        console.log('put e', e);
        return res.send(error(500, e.message));
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await User.findById(userId).populate({
            path: "posts",
            populate: {
                path: "owner",
            },
        });

        const fullPosts = user.posts;
        const posts = fullPosts
            .map((item) => mapPostOutput(item, req._id))
            .reverse();

        return res.send(success(200, { ...user._doc, posts }));
    } catch (e) {
        console.log('error put', e);
        return res.send(error(500, e.message));
    } 
};


module.exports = {
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteUser,
    getMyInfo,
    updateUserProfile,
    getUserProfile
}