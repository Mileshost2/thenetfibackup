const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    nextPriceUpdate: Date,
    // endDate: {
    //     type: Date,
    //     required: true,
    //     default: Date.now
    // },
    tradeType: {
        type: String,
        required: true,
        enum: ['Forex', 'Stocks', 'Crypto', 'Staking', 'Real Estate']
    },
    tradeCurrency: {
        type: String,
        required: true,
        // enum: ['Bitcoin', 'Ethereum', 'Litecoin', 'USDT', 'SOL', 'Matic', 'Ton', 'Doge',
        //         'Ripple', 'Polkadot', 'Cardano', 
        //         'EUR/USD','EUR/JPY','GBP/USD','USD/JPY','USD/CAD','EUR/GBP','EUR/CHF',
        //         'AUD/USD','USD/CHF','NZD/USD','GBP/CHF','NZD/JPY','NZD/CHF','EUR/CAD',
        //         'AUD/CAD','GBP/JPY','AUD/NZD','AUD/JPY','EUR/AUD',
        //         'GOOG', 'AAPL', 'PEP', 'TSLA', 'AMZN', 'MSFT', 'FDX', 'UPS', 'DIS',
        //         'SPX', 'DJI', 'IXIC', 'FTSE', 'DAX', 'CAC', 'N225', 'HSI', 'ASX', 'SSE',
        //         'US10Y', 'US30Y', 'JP10Y', 'UK10Y', 'FR10Y', 'AU10Y', 'CA10Y'
        // ]
    },
    tradeSymbol: {
        type: String,
        required: true
    },
    cryptoAddress: String,
    currencyWallet: {
        type: Number,
        default: 0
    },
    lastinvestedamount: {
        type: Number,
        default: 0
    },
    lastinvestmentprofit: {
        type: Number,
        default: 0
    },
    lastSessionID: String,
    currentinvestedamount: {
        type: Number,
        default: 0
    },
    currentinvestmentprofit: {
        type: Number,
        default: 0
    },
    currentSessionID: String,
    // profitpercentage: String,
    // charges: String,
    dailyroi: {
        type: Number,
        default: 10
    },
    status: {
        type: String,
        required: true,
        default: 'Inactive',
        enum: ['Pending', 'Active', 'Inactive']
    },
    userFirstname: String,
    userLastname: String,
    userEmail: String,
    userID: String,
    validateUser: {type: Schema.Types.ObjectId, ref: 'Users'},
    tradeTracker: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tradetracker'
        }
    ],
})



module.exports = mongoose.model('Trade', tradeSchema);