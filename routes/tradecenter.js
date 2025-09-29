//NPM Dependencies//
const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const Transaction = require('../models/transaction');
const Notification = require('../models/notification');
const Investment = require('../models/investment');
const Referral = require('../models/referral');
const Trades = require('../models/trade');
const Tradetracker = require('../models/tradetracker');
const Depositmethods = require('../models/depositmethod');
const Managers = require('../models/manager');
const Wallet = require('../models/wallets');
const Wallets = require('../models/wallets');
const Post = require('../models/post');
const Plans = require('../models/plans');
const passport = require('passport');
const nodemailer = require("nodemailer");
const {sendEmail, welcomeMail, otpMail, emailActMail, passwordResetMail, verifyMail, acctVerifiedMail, depositMail, openInvestmentMail, endInvestmentMail} = require("../utils/sendEmail");
const fs = require("fs");
const ejs = require("ejs");
const multer  = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });
const bcrypt = require('bcrypt');
const axios = require('axios');
const { constants } = require('fs/promises');
const moment = require('moment-timezone');
require('moment-timezone/data/packed/latest.json');
const crypto = require("crypto");
//End of NPM Dependencies//


//Middlewares//
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    } 
    next();
}

const isClient = async(req, res, next) => {
    const { email, password } = req.body;
    const user = await Users.findOne({email});
    if (!user) {
        req.flash('error', 'Incorrect Username or Password!')
        return res.redirect('/login');
    } else if (user.role !== 'client') {
        req.flash('error', 'You do not have permission to access this route!')
        return res.redirect('/login')
    } 
    next();
}

const onlyClient = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    if (user.role !== 'client') {
        req.flash('error', 'You do not have permission to access this route!')
        return res.redirect('/')
    } 
    next();
}

const checkAcct = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    if (user.acctstatus === 'Not Active') {
        req.flash("error", "Upload your I.D card to confirm your identity.")
        return res.redirect('/dashboard')
    } else if (user.acctstatus === 'Suspended') {
        req.flash('error', 'Your account was suspended for violating a rule. Contact your account manager to lift suspension')
        return res.redirect('/dashboard')
    }
    next();
}

const confirmOTP = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    if (user.validateaccount !== 'Yes') {
        return res.redirect('/verify_email')
    } 
    next();
}

const validateWithdrawal = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate('investment');
    if (user.allowWithdrawal === 'No') {
        req.flash("error", "Your account is not yet enabled to withdraw, please contact your account's manager.")
        return res.redirect('/dashboard/withdrawal')
    } else if (user.acctstatus === 'Suspended') {
        req.flash("error", "Your account was recently suspended for violating one of our rules, please contact your account's manager or send a mail to us to lift the suspension before proceeding with your withdrawal.")
        return res.redirect('/dashboard/withdrawal')
    }
    next();
}

const validateTrade = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    if (user.wallet < user.walletBalanceLimit) {
        req.flash("error", `Your wallet balance must be higher than $${user.walletBalanceLimit.toLocaleString()} for you to place trades.`)
        return res.redirect('/dashboard')
    } else if (user.allowTrade === 'No') {
        req.flash("error", "Your account is currently not eligible to place trades. Please contact your account manager.")
        return res.redirect('/dashboard')
    } 
    next();
}


//End of Middlewares//

// router.get('/dashboard/markets', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id).populate({path: 'trades'});
//     const alltrades  = await Trades.find({validateUser: user});
//     const cryptotrades  = await Trades.find({tradeType: "Crypto", validateUser: user});
//     const forextrades  = await Trades.find({tradeType: "Forex", validateUser: user});
//     const stockstrades  = await Trades.find({tradeType: "Stocks", validateUser: user});
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('trade/markets', {user, alltrades, cryptotrades, forextrades, stockstrades, unreadmsg});
// });

router.get('/dashboard/markets', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const alltrades  = await Trades.find({validateUser: user});
    const cryptotrades  = await Trades.find({tradeType: "Crypto", validateUser: user});
    const forextrades  = await Trades.find({tradeType: "Forex", validateUser: user});
    const stockstrades  = await Trades.find({tradeType: "Stocks", validateUser: user});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('trade/assets', {user, alltrades, cryptotrades, forextrades, stockstrades, unreadmsg});
});


// router.get('/dashboard/crypto', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id).populate({path: 'trades'});
//     const btc  = await Trades.findOne({tradeCurrency: "Bitcoin", validateUser: user});
//     const eth  = await Trades.findOne({tradeCurrency: "Ethereum", validateUser: user});
//     const ltc  = await Trades.findOne({tradeCurrency: "Litecoin", validateUser: user});
//     const sol  = await Trades.findOne({tradeCurrency: "SOL", validateUser: user});
//     const ton  = await Trades.findOne({tradeCurrency: "Ton", validateUser: user});
//     const usdt  = await Trades.findOne({tradeCurrency: "USDT", validateUser: user});
//     const matic  = await Trades.findOne({tradeCurrency: "Matic", validateUser: user});
//     const doge  = await Trades.findOne({tradeCurrency: "Doge", validateUser: user});
//     const totalbal = parseInt(btc.currencyWallet) + parseInt(eth.currencyWallet) + parseInt(ltc.currencyWallet) + parseInt(ton.currencyWallet) + parseInt(matic.currencyWallet) + parseInt(sol.currencyWallet) + parseInt(usdt.currencyWallet) + parseInt(doge.currencyWallet);
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('trade/cryptotrade', {user, unreadmsg, btc, eth, ltc, sol, ton, matic, doge, usdt, totalbal});
// });

// router.get('/dashboard/forex', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id).populate({path: 'trades'});
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('trade/forextrade', {user, unreadmsg});
// });

// router.get('/dashboard/stocks', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id).populate({path: 'trades'});
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('trade/stocks', {user, unreadmsg});
// });

// router.get('/dashboard/indices', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id).populate({path: 'trades'});
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('trade/indices', {user, unreadmsg});
// });

// router.get('/dashboard/binary-options', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id).populate({path: 'trades'});
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('trade/binaryoptions', {user, unreadmsg});
// });

// router.get('/dashboard/bonds', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id).populate({path: 'trades'});
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('trade/bonds', {user, unreadmsg});
// });

router.get('/trade/btc', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const btc  = await Trades.findOne({tradeSymbol: "BTC", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: btc}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: btc.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: btc}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: btc}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/btc', {user, unreadmsg, btc, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/eth', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const eth  = await Trades.findOne({tradeSymbol: "ETH", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: eth}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: eth.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: eth}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: eth}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/eth', {user, unreadmsg, eth, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/ltc', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const ltc  = await Trades.findOne({tradeSymbol: "LTC", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: ltc}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: ltc.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: ltc}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: ltc}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/ltc', {user, unreadmsg, ltc, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/sol', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const sol  = await Trades.findOne({tradeSymbol: "SOL", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: sol}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: sol.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: sol}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: sol}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/sol', {user, unreadmsg, sol, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/matic', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const matic  = await Trades.findOne({tradeSymbol: "MATIC", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: matic}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: matic.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: matic}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: matic}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/matic', {user, unreadmsg, matic, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/doge', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const doge  = await Trades.findOne({tradeSymbol: "DOGE", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: doge}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: doge.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: doge}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: doge}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/doge', {user, unreadmsg, doge, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/dot', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const polkadot  = await Trades.findOne({tradeSymbol: "DOT", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: polkadot}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: polkadot.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: polkadot}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: polkadot}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/polkadot', {user, unreadmsg, polkadot, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/ada', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const cardano  = await Trades.findOne({tradeSymbol: "ADA", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: cardano}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: cardano.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: cardano}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: cardano}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/cardano', {user, unreadmsg, cardano, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/xrp', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const ripple  = await Trades.findOne({tradeSymbol: "XRP", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: ripple}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: ripple.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });    
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: ripple}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: ripple}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/ripple', {user, unreadmsg, ripple, trades, tradetransactions, wallettransactions, tradinghistory});
});


router.get('/trade/usdt', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "USDT", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/usdt', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/dash', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "DASH", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/dash', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/usdc', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "USDC", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/usdc', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/orn', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "ORN", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/orn', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/aurora', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AURORA", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/aurora', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/boring', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "BORING", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/boring', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/bch', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "BCH", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/bch', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/aave', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AAVE", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/aave', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/shib', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "SHIB", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/shib', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/dai', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "DAI", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/dai', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/ogn', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "OGN", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/ogn', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/trx', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "TRX", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/trx', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});



// router.get('/trade/ton', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id).populate({path: 'trades'});
//     const ton  = await Trades.findOne({tradeSymbol: "Ton", validateUser: user});
//     const trades  = await Tradetracker.find({action: "Trade", validateTrade: ton}).sort({date: -1});
//     const tradinghistory  = await Investment.find({validateTradeID: ton.id, validateUser: user}).sort({startDate: -1});
//     const tradetransactions  = await Tradetracker.find({
//         $and: [
//             {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
//             {validateTrade: ton}
//         ]}).sort({date: -1});
//     const wallettransactions  = await Tradetracker.find({
//         $and: [
//             {action: { $in: ["Deposit", "Withdraw"]}},
//             {validateTrade: ton}
//         ]}).sort({date: -1});
//         console.log(ton)
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//         res.render('trade/ton', {user, unreadmsg, ton, trades, tradetransactions, wallettransactions, tradinghistory});
// });





router.get('/trade/:id/activate', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet = await Trades.findById(req.params.id);
    // const tradingplans = await InvestmentPlans.find({}).sort({minamount: 1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('trade/cryptoplans', {user, unreadmsg, wallet});
});

router.post('/trade/:walletid/activate-trade', isLoggedIn, onlyClient, checkAcct, validateTrade, async(req, res) => {
    const {walletid, planid} = req.params;
    const user = await Users.findById(req.user.id);
    const now = new Date();
    const wallet = await Trades.findById(walletid);
    // const investmentplan = await InvestmentPlans.findById(planid);

    const {investedamount, duration, stoploss, takeprofit, ordertype} = req.body;

    const newtrade = new Investment({investedamount: investedamount, investmentType: wallet.tradeType, startDate: new Date(), packagetype: ordertype, tradedCurrency: wallet.tradeCurrency,
          duration: duration, stoploss, takeprofit, status: 'Active', investmentprofit: 0.00, validateUser: user, validateTradeID: wallet.id});
    if (investedamount <= user.wallet) {

            await wallet.updateOne({status: "Active", currentinvestedamount: investedamount, currentSessionID: newtrade.id }, { runValidators: true, new: true });
            const newWalletTransaction = new Tradetracker({amount: investedamount, tradeCurrency: wallet.tradeCurrency, action: 'Trade Opened', status: "Successful", validateTrade: wallet, tradeId: wallet.id, investmentId: newtrade.id});
            wallet.tradeTracker.push(newWalletTransaction);
            await newWalletTransaction.save();

            user.investment.push(newtrade);
            await newtrade.save();
            await user.save()
            await user.updateOne({wallet: user.wallet - newtrade.investedamount}, { runValidators: true, new: true });
            // const subject = 'TRADE OPENED';
            // await openInvestmentMail(user.email, subject, user.firstname, newtrade.packagetype, newtrade.investedamount);
            req.flash('success', 'Trade Opened')
            res.redirect(`/dashboard/trade/${newtrade.id}`);
     
    } else {
        req.flash('error', 'Your wallet does not have enough fund to proceed');
        res.redirect(`/trade/${wallet.id}/activate`);
    } 
});



//FOREX ROUTES//
router.get('/trade/audcad', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AUDCAD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/audcad', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/audjpy', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AUDJPY", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/audjpy', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/audnzd', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AUDNZD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/audnzd', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/audusd', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AUDUSD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/audusd', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/euraud', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "EURAUD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/euraud', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/eurcad', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "EURCAD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/eurcad', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/eurchf', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "EURCHF", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/eurchf', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/eurgbp', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "EURGBP", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/eurgbp', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/eurjpy', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "EURJPY", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/eurjpy', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/eurusd', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "EURUSD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/eurusd', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/gbpchf', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "GBPCHF", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/gbpchf', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/gbpjpy', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "GBPJPY", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/gbpjpy', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/gbpusd', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "GBPUSD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/gbpusd', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/nzdchf', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "NZDCHF", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/nzdchf', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/nzdjpy', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "NZDJPY", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/nzdjpy', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/nzdusd', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "NZDUSD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/nzdusd', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/usdcad', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "USDCAD", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/usdcad', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/usdchf', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "USDCHF", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/usdchf', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/usdjpy', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "USDJPY", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('currencypairs/usdjpy', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

//STOCKS

router.get('/trade/googl', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "GOOGL", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/google', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/aapl', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AAPL", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/aapl', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/msft', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "MSFT", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/microsoft', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/tsla', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "TSLA", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/tesla', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/amzn', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AMZN", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/amazon', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/pep', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "PEP", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/pepsi', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/dis', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "DIS", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/disney', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/fdx', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "FDX", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/fedex', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/ups', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "UPS", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/ups', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});

router.get('/trade/snap', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "SNAP", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/snap', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});


router.get('/trade/ma', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "MA", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/ma', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});


router.get('/trade/csco', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "CSCO", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/csco', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});


router.get('/trade/ko', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "KO", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/ko', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});


router.get('/trade/nflx', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "NFLX", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/nflx', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});


router.get('/trade/axp', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    const wallet  = await Trades.findOne({tradeSymbol: "AXP", validateUser: user});
    const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    const tradinghistory = await Investment.find({validateTradeID: wallet.id, validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({ startDate: -1 });
    const tradetransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const wallettransactions  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Deposit", "Withdraw"]}},
            {validateTrade: wallet}
        ]}).sort({date: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/axp', {user, unreadmsg, wallet, trades, tradetransactions, wallettransactions, tradinghistory});
});





router.get('/dashboard/trades', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'trades'});
    // const trades  = await Tradetracker.find({action: "Trade", validateTrade: wallet}).sort({date: -1});
    // const openedtrades  = await Investment.find({status: 'Active', validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({startDate: -1});
    // const closedtrades  = await Investment.find({status: 'Completed', validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({startDate: -1});
    openedtrades  = await Investment.find({status: 'Active', validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({startDate: -1});
    const closedtrades  = await Investment.find({status: 'Completed', validateUser: user, packagetype: { $in: ['Buy', 'Sell'] }}).sort({startDate: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
        res.render('trade/trades', {user, unreadmsg, openedtrades, closedtrades});
});









module.exports = router;