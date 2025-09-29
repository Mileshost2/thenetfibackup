const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const Transaction = require('../models/transaction');
const Notification = require('../models/notification');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100');
});


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: false,
        unique: false,
    },
    accountManagerId: String,
    subscribedSignalId: String,
    subscribedSubscriptionId: String,
    password: String,
    firstname: String, 
    lastname: String,
    confirmpassword: String,
    phonenumber: Number,
    gender: String,
    country: String,
    state: String,
    city: String,
    address: String,
    age: Number,
    // btcwalletaddress: String,
    // ethwalletaddress: String,
    // ltcwalletaddress: String,
    // usdtwalletaddress: String,
    // solwalletaddress: String,
    // maticwalletaddress: String,
    // tonwalletaddress: String,
    // dogewalletaddress: String,
    uid: {
        type: Number,
    },
    validationcode: {
        type: Number,
    },
    validateaccount: {
        type: String,
        required: true,
        default: 'No',
        enum: ['No', 'Yes']
    },
    basecurrency: {
        type: String,
        required: false,
        // unique: false,
    },
    basecurrencysymbol: {
        type: String,
        required: false,
        // unique: false,
    },
    wallet: {
        type: Number,
        default: 0
    },
    totalprofits: {
        type: Number,
        default: 0
    },
    tradebonus: {
        type: Number,
        default: 0
    },
    totaldeposits: {
        type: Number,
        default: 0
    },
    totalwithdrawals: {
        type: Number,
        default: 0
    },
    tradeprogress: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        required: true,
        default: 'client',
        enum: ['client', 'admin']
    },
    verificationstatus: {
        type: String,
        required: true,
        default: 'Not Verified',
        enum: ['Not Verified', 'Pending', 'Verified']
    },
    acctstatus: {
        type: String,
        required: true,
        default: 'Not Active',
        enum: ['Not Active', 'Active', 'Suspended']
    },
    allowWithdrawal: {
        type: String,
        required: true,
        default: 'No',
        enum: ['No', 'Yes']
    },
    allowTrade: {
        type: String,
        required: true,
        default: 'No',
        enum: ['No', 'Yes']
    },
    walletBalanceLimit: {
        type: Number,
        required: true,
        default: 1000,
    },
    verificationdocument: [ImageSchema],
    passport: [ImageSchema],
    profilepicture: [ImageSchema],
    documenttype: String,
    transaction: [ 
        {
            type: Schema.Types.ObjectId,
            ref: 'Transaction'
        }
    ],
    trades: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Trade'
        }
    ],
    investment: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Investment'
        }
    ],
    staker: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Staking'
        }
    ],
    wallets: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Token'
        }
    ],
    referredby: String,
    referralincomes: {
        type: Number,
        required: true,
        default: 0
    },
    notifications: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Notification'
        }
    ],
    referrals: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Referral'
        }
    ],
    accountchargesStatus: {
        type: String,
        required: true,
        default: 'Unpaid',
        enum: ['Paid', 'Pending', 'Unpaid']
    },
    accountcharges: Number,
    accountType: {
        type: String,
        required: true,
        default: 'Basic',
    },
    upgradefeeStatus: {
        type: String,
        required: true,
        default: 'Unpaid',
        enum: ['Paid', 'Pending', 'Unpaid']
    },
    upgradefee: Number,
    accessCode: String,
    // taxfeeStatus: {
    //     type: String,
    //     required: true,
    //     default: 'Unpaid',
    //     enum: ['Paid', 'Pending', 'Unpaid']
    // },
    // taxfee: Number
})

userSchema.plugin(passportLocalMongoose);

// userSchema.post('findOneAndDelete', async function(doc) {
//     if(doc){
//         await Review.deleteMany({
//             _id: {
//                 $in: doc.reviews
//             }
//         })
//     }
// })

module.exports = mongoose.model('Users', userSchema);