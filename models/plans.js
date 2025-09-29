const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planSchema = new Schema({
    planType: {
        type: String,
        required: true,
        enum: ['Account Upgrade', 'Signal', 'Investment']
    },
    name:  {
        type: String,
        required: true,
        unique: true
    },
    amount: Number,
    minamount: Number,
    maxamount: Number,
    duration: String,
    description: String,
    roi: String
})



module.exports = mongoose.model('Plan', planSchema);