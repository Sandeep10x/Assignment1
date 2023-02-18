const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Post = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    user: {
        type: String
    }
})

module.exports = mongoose.model("posts", Post);