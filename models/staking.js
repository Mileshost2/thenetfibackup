const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stakingSchema = new Schema({
    startDate: String,
    cryptoType: String,
    usdAmountStaked: Number,
    cryptoAmountStaked: Number,
    duration: String,
    profitpercentage: String,
    profitroi: Number,
    cryptoprofitroi: Number,
    charges: String,
    status: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Active', 'Completed']
    },
    validateUser: {type: Schema.Types.ObjectId, ref: 'Users'},
    userId: String,
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    nextPriceUpdate: Date,
    endDate: Date,
    investmentprofit: {
        type: Number,
        default: 0
    },

});



module.exports = mongoose.model('Staking', stakingSchema);