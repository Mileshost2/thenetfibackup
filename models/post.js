const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100');
});

const postSchema = new Schema({
    date: Date,
    // date: {
    //     type: Date,
    //     default: Date.now
    // },
    title: String,
    description: String,
    postpictures: [ImageSchema],
})



module.exports = mongoose.model('Post', postSchema);