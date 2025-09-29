const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100');
});


const reviewSchema = new Schema({
    fullname: String,
    review: String,
    title: String,
    passport: [ImageSchema]
})



module.exports = mongoose.model('Review', reviewSchema);