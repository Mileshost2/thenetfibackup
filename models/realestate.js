const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100');
});


const realestateSchema = new Schema({
    fullname: String,
    email: String,
    winrate: String,
    wins: Number,
    profitshare: String,
    losses: Number,
    numberofsubscribers: Number,
    passport: [ImageSchema],
    subscribers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
})



module.exports = mongoose.model('RealEstate', realestateSchema);