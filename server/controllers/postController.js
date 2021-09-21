const multer = require('multer');
const jimp = require('jimp');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');

const imageUploadOptions = {
    storage: multer.memoryStorage(),
    limits: {
        // storing image files up to 1mb
        fileSize: 1024 * 1024 * 1
    },
    fileFilter: (req, file, next) => {
        if(file.mimetype.startsWith("image/")) {
            next(null, true);
        } else {
            next(null, false);
        }
    }
};


exports.uploadImage = multer(imageUploadOptions).single('image');

exports.resizeImage = async (req, res, next) => {
    if(!req.file){
        return next();
    }
    const extension = req.file.mimetype.split("/")[1]
    req.body.image = `/static/uploads/${req.user.name}-${Date.now()}.${extension}`;

    const image = await jimp.read(req.file.buffer);
    await image.resize(750, jimp.AUTO); // resize image
    await image.write(`./${req.body.image}`); // include relative path to add to static folder
    next();
};

exports.addPost = async (req, res) => {
    req.body.postedBy = req.user._id;

    const post = await new Post(req.body).save();
    await Post.populate(post, {
        path: 'postedBy',
        select: '_id name avatar'
    })

    res.json(post);
};

exports.getPostById = async (req, res, next, id) => {
    const post = await Post.findOne({ _id: id });
    req.post = post;

    // take postedBy id and compare with req user id
   const posterId = mongoose.Types.ObjectId(req.post.postedBy._id);
   if (req.user && posterId.equals(req.user._id)) {
       req.isPoster = true;
       return next();
   }
   next();
};

exports.deletePost = async (req, res) => {

    const { _id } = req.post; // destructure id from req.post

    if(!req.isPoster) {
        return res.status(400).json({
            message: "You are not authorized to peform this action"
        }); // if user trys to delete post thats not theirs
    }

    const deletedPost = await Post.findOneAndDelete({ _id});
    res.json(deletedPost); // return deleted post
};


exports.getPostsByUser = async (req,res) => {
    const posts = await Post.find({ postedBy: req.profile._id }).sort({
        createdAt: "desc"
    });
    res.json(posts);
};

exports.getPostFeed = async (req, res) => {
    const { following, _id } = req.profile;

    following.push(_id);
    const posts = await Post.find({ postedBy: { $in: following }}).sort({
        createdAt: "desc"
    });
    res.json(posts);
};

exports.toggleLike = async (req, res) => {
    const { postId } = req.body;

    const post = await Post.findOne({ _id: postId })
    const likeIds = post.likes.map(id => id.toString()); // map over like ids and convert to string

    //compare likes in array with currently authenticated users id
    const authUserId = req.user._id.toString(); // convert id to string to compare
    if(likeIds.includes(authUserId)) {
        await post.likes.pull(authUserId); // if the curent user id is in likes array remove it to unlike it
    } else {
        await post.likes.push(authUserId); // otherwise add it to array
    }
    await post.save();
    res.json(post);
};

exports.toggleComment = async (req, res) => {
    const { comment, postId } = req.body;
    let operator;
    let data;

    if(req.url.includes('uncomment')){ // if user wants to unccoment
        operator = "$pull"; // set operator to pull to pull comment
        data = {_id: comment._id } // set comment id
    } else {
        operator = "$push"; // set operator to push comment into array
        data = { text: comment.text, postedBy: req.user._id }; // set data to text and userId who posted
    }

    const updatedPost = await Post.findOneAndUpdate(
        {_id: postId},
        { [operator]: { comments: data }},
        { new: true }
    ).populate('postedBy', "_id name avatar").populate('comments.postedBy',
    "_id name avatar");
    res.json(updatedPost);
};
