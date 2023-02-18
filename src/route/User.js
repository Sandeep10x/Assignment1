const router = require("express").Router();
const User = require("../model/User.js");
const jwt = require("jsonwebtoken");
const Post = require("../model/Post.js");

router.get("/users", async(req, res) => {
    User.find().exec((err,task)=>{
        res.status(200).json(task);
    })
})
router.post("/register", async(req, res) => {
    const user = new User(req.body)
    await user.save().then(
        ()=>{
            res.status(200).json({msg:"User Created Successfully",user:user});
        }
    ).catch(()=>{
        res.status(400).json({msg:"User Email already registered"});
    });
})
router.post("/login", async(req, res, next) => {
    User.find().then(data=>{
        data.map(person => {
            if(person.email===req.body.email){
                req.user = person;
            }
        })
        if(req.user===undefined){
            res.status(400).json({msg:"User not found"});
        }else{
            next();
        }
    })
}, (req, res)=>{
    if(req.body.email===req.user.email && req.body.password===req.user.password){
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
            userEmail: req.user.email,
            userId: req.user._id
        }
        const token = jwt.sign(data, jwtSecretKey);
        res.status(200).json({msg:"Login Successful", user:req.user, token:token});
    }else{
        res.status(400).json({msg:"Password not matched"});
    }
})
router.post("/posts", (req, res, next) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const token = req.header(tokenHeaderKey);
    const data = jwt.verify(token, jwtSecretKey);
    if(data){
        req.user = data;
        next()
    }else{
        return res.status(401).json({msg:"Verification unsuccessful"});
    }
}, async(req, res) => {
    const post = new Post(req.body);
    post.user = req.user.userId;
    await post.save().then((data)=>{
        res.status(200).json({msg:"Post added",response:data, user:req.user});
    })
})
router.put("/posts/:postId", (req, res, next) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const token = req.header(tokenHeaderKey);
    const data = jwt.verify(token, jwtSecretKey);
    if(data){
        req.user = data;
        next()
    }else{
        return res.status(401).json({msg:"Verification unsuccessful"});
    }
}, async(req, res, next) => {
    await Post.findById(req.params.postId).exec((err, post) => {
        if(post.user===req.user.userId){
            next();
        }else{
            res.status(401).json({msg:"Access Denied! You are trying to access another users Post"})
        }
    })
}, async(req, res) => {
    Post.findByIdAndUpdate(req.params.postId, req.body, (err, post) => {
        if(err || !post){
            console.log(err);
            res.status(404);
            res.write("Error occured while updating the post");
        }else{
            res.status(200).json({
                msg: "updated successfully",
                updatedPost: post 
            });
        }
    })
})
router.delete("/posts/:postId", (req, res, next) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const token = req.header(tokenHeaderKey);
    const data = jwt.verify(token, jwtSecretKey);
    if(data){
        req.user = data;
        next();
    }else{
        return res.status(401).json({msg:"Verification unsuccessful"});
    }
}, async(req, res, next) => {
    await Post.findById(req.params.postId).exec((err, post) => {
        if(post.user===req.user.userId){
            next();
        }else{
            res.status(401).json({msg:"Access Denied! You are trying to access another users Post"})
        }
    })
}, async(req, res) => {
    await Post.findByIdAndDelete(req.params.postId, req.body)
    res.status(200).json({msg:"Deleted Successfully"});
})
router.get("/posts", async(req, res) => {
    await Post.find().exec((err, posts) => {
        res.status(200).json({posts:posts});
    })
})
module.exports = router;