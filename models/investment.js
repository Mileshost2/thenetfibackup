const { duration } = require('moment-timezone');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const investmentSchema = new Schema({
    investmentType: {
        type: String,
        required: true,
        enum: ['Forex', 'Stocks', 'Crypto', 'Staking', 'Real Estate']
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: false
    },
    nextPriceUpdate: Date,
    packagetype: String,
    tradedCurrency: String,
    investedamount: {
        type: Number,
        default: 0
    },
    investmentprofit: {
        type: Number,
        default: 0
    },
    duration: String,
    roi: String,
    charges: String,
    takeprofit: Number,
    stoploss: Number,
    expectedincome: Number,
    status: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Active', 'Completed']
    },
    validateUser: {type: Schema.Types.ObjectId, ref: 'Users'},
    validateTradeID: String,
})



module.exports = mongoose.model('Investment', investmentSchema);