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
const Recaptcha = require('express-recaptcha').RecaptchaV2;
//End of NPM Dependencies//


//Javascript Time and Date Setup//
// const today = new Date();
// const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
// const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
// const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
// const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
// const dateTime = date+' '+time+ ' ' + ampm;
//End of Javascript Time and Date Setup//

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
    // } else if (user.acctstatus === 'Suspended') {
    //     req.logout();
    //     req.flash("error", "Your account was suspended! Please contact your account's manager.")
    //     return res.redirect('/login')
    } 
    next();
}

// const checkAcct = async(req, res, next) => {
//     const id = req.user.id;
//     const user = await Users.findById(id);
//     if (user.validateaccount !== 'Yes') {
//         return res.redirect('/verify_email')
//     } else if (user.acctstatus === 'Not Active') {
//         req.flash("error", "Upload your I.D card to confirm your identity.")
//         return res.redirect('/user/kyc')
//     } else if (user.acctstatus === 'Suspended') {
//         req.flash('error', 'Your account was suspended for violating a rule. Contact your account manager to lift suspension')
//         return res.redirect('/user/account-suspended')
//     }
//     next();
// }

const checkAcct = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    if (user.acctstatus === 'Not Active') {
        req.flash("error", "Upload your I.D card to confirm your identity.")
        return res.redirect('/user/kyc')
    } else if (user.acctstatus === 'Suspended') {
        req.flash('error', 'Your account was suspended for violating a rule. Contact your account manager to lift suspension')
        return res.redirect('/user/account-suspended')
    }
    next();
}


// const confirmOTP = async(req, res, next) => {
//     const id = req.user.id;
//     const user = await Users.findById(id);
//     if (user.validateaccount !== 'Yes') {
//         return res.redirect('/verify_email')
//     } 
//     next();
// place on kyc and suspended acct route;
// }

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


// const paidAcctCharges = async(req, res, next) => {
//     const id = req.user.id;
//     const user = await Users.findById(id);
//     if (user.accountchargesStatus === 'Unpaid') {
//         req.flash('error', 'You are yet to pay your investment service charge!')
//         return res.redirect('/user/service-charge-payment')
//     } 
//     next();
// }

// const paidUpgradeFee = async(req, res, next) => {
//     const id = req.user.id;
//     const user = await Users.findById(id);
//     if (user.upgradefeeStatus === 'Unpaid') {
//         req.flash('error', 'You need to upgrade your account in order to withdraw funds!')
//         return res.redirect('/user/account-upgrade')
//     } 
//     next();
// }

const validateWithdrawal = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate('investment');
    // if (user.investment.length === 0) {
    //     req.flash('error', 'You need to make a minimum of 1 investment to be qualified for withdrawals!')
    //     return res.redirect('/dashboard/investments')
    // }
    if (user.allowWithdrawal === 'No') {
        req.flash("error", "Your account is not yet enabled to withdraw, please contact your account's manager.")
        return res.redirect('/dashboard/withdrawal')
    } else if (user.acctstatus === 'Suspended') {
        req.flash("error", "Your account was recently suspended for violating one of our rules, please contact your account's manager or send a mail to us to lift the suspension before proceeding with your withdrawal.")
        return res.redirect('/dashboard/withdrawal')
    }
    next();
}
//End of Middlewares//
    

//Routes//

const recaptcha = new Recaptcha('6Le1Y5QqAAAAAJctUe_bEnt897qvgpirCDXlqs2c', '6Le1Y5QqAAAAAK8WZJyn7j1-02kCMzeh6NlbB7kD');


router.get('/register', (req, res) => {
    res.render('signup');
});

router.post('/register', recaptcha.middleware.verify, async(req, res) => {
    if (!req.recaptcha.error) {
        try {
                const random8Numbers = Math.floor(20000000 + Math.random() * 54890765);
                const random4Numbers = Math.floor(2000 + Math.random() * 5489);

            const { email, country, basecurrency, basecurrencysymbol, gender, firstname, lastname, phonenumber, password, confirmpassword, accessCode } = req.body;
            const existingUser = await Users.findOne({email: email });
            if (existingUser) {
                req.flash('error', 'Email already in use. Please enter another email or sign in.');
                res.redirect('/register');
            } else {

                const registeredUser = new Users({
                    email, country, basecurrency, basecurrencysymbol, gender, firstname, lastname, phonenumber, confirmpassword, accessCode, 
                    referralincomes: 0, wallet: 0, totalprofits: 0, uid: random8Numbers, validationcode: random4Numbers
                });

                    if (confirmpassword == password) {

                        const hashedpassword = await bcrypt.hash(password, 12);
                        registeredUser.password = hashedpassword;

                            const enumData = ['GBPUSD', 'GBPJPY', 'GBPCHF', 'EURUSD', 'EURJPY', 'EURAUD', 'EURCAD', 'EURGBP', 'EURCHF',  
                                        'USDCHF', 'NZDUSD', 'AUDCAD',  'AUDNZD', 'AUDJPY', 'AUDUSD',];
                            async function createTrades(registeredUser) {
                            const trades = [];
                            for (const tradeCurrency of enumData) {
                                const newTrade = new Trades({ tradeCurrency, tradeSymbol: tradeCurrency, tradeType: 'Forex', userFirstname: registeredUser.firstname, userLastname: registeredUser.lastname, userEmail: registeredUser.email, userId: registeredUser.id, validateUser: registeredUser});
                                trades.push(newTrade);
                            }
                            try {
                                await Promise.all(trades.map(trade => trade.save()));
                                    console.log('Forex Trades created successfully!');
                                } catch (error) {
                                    console.error('Error creating forex trades:', error);
                                }
                            }
                            // createTrades(registeredUser);
                            const savetrade = await createTrades(registeredUser);


                            const enumData2 = ['Google', 'Apple', 'Pepsico', 'Tesla', 'Amazon', 'Microsoft', 'Disney', 'Netflix', 'Cisco', 'Snap Inc', 'Mastercard', 'Coca Cola', 'American Express'];
                            const enumData2Symbol = ['GOOGL', 'AAPL', 'PEP', 'TSLA', 'AMZN', 'MSFT', 'DIS', 'NFLX', 'CSCO', 'SNAP', 'MA', 'KO', 'AXP'];
                            async function createTrades2(registeredUser) {
                            const trades = [];
                            for (let x = 0; x < enumData2.length; x++) {
                                const newTrade = new Trades({ tradeCurrency: enumData2[x], tradeSymbol: enumData2Symbol[x], tradeType: 'Stocks', userFirstname: registeredUser.firstname, userLastname: registeredUser.lastname, userEmail: registeredUser.email, userId: registeredUser.id, validateUser: registeredUser});
                                trades.push(newTrade);
                            }
                            try {
                                await Promise.all(trades.map(trade => trade.save()));
                                    console.log('Stocks Trades created successfully!');
                                } catch (error) {
                                    console.error('Error creating Stocks trades:', error);
                                }
                            }
                            // createTrades2(registeredUser);
                            const savetrade2 = await createTrades2(registeredUser);

                            
                            enumData4 = ['Bitcoin', 'Ethereum', 'Litecoin', 'Polygon', 'Dash', 'Orion Protocol', 'Tether', 'USD Coin', 'Polkadot', 'Ripple', 'Cardano', 'Dogecoin', 'Solana', 'Aurora', 'Boring DAO', 'Bitcoin Cash', 'AAVE', 'Shiba Inu', 'Dai', 'Origin Protocol', 'Tron' ]
                            enumData4Symbol = ['BTC', 'ETH', 'LTC', 'MATIC', 'DASH', 'ORN', 'USDT', 'USDC', 'DOT', 'XRP', 'ADA', 'DOGE', 'SOL', 'AURORA', 'BORING', 'BCH', 'AAVE', 'SHIB', 'DAI', 'OGN', 'TRX' ]
                            async function createTrades4(registeredUser) {
                                const trades = [];
                                for (let x = 0; x < enumData4.length; x++) {
                                    const newTrade = new Trades({ tradeCurrency: enumData4[x], tradeSymbol: enumData4Symbol[x], tradeType: 'Crypto', userFirstname: registeredUser.firstname, userLastname: registeredUser.lastname, userEmail: registeredUser.email, userId: registeredUser.id, validateUser: registeredUser});
                                    trades.push(newTrade);
                                }
                                try {
                                    await Promise.all(trades.map(trade => trade.save()));
                                        console.log('Crypto Trades created successfully!');
                                    } catch (error) {
                                        console.error('Error creating Crypto trades:', error);
                                    }
                                }
                                // createTrades4(registeredUser);
                                const savetrade4 = await createTrades4(registeredUser);
                                
                        
                        await registeredUser.save();
                        console.log(random4Numbers)
                        const subject = 'SIGNUP SUCCESS!!';
                        await welcomeMail(registeredUser.email, subject, registeredUser.firstname, random4Numbers);
                        req.login(registeredUser, err => {
                            if (err) return next(err);
                            req.flash('success', 'Welcome!!');
                            res.redirect('/dashboard');
                        })
                    } else {
                        req.flash('error', 'Password and Confirm Password does not match');
                        res.redirect('/register');
                    }    
                }   

        } catch (e) {
            req.flash('error', e.message);
            res.redirect('/register');
        }
    } else {
        // CAPTCHA verification failed
        // res.render('signup', { error: 'CAPTCHA verification failed. Please try again.' });
        req.flash('error', 'CAPTCHA verification failed. Please try again.');
        res.redirect('/register');
    }
});

// router.get('/verify_email', isLoggedIn, onlyClient, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id);
//     res.render('verifypage', {user});
// });

// router.post('/resend_otp', isLoggedIn, onlyClient, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id);
//     const random4Numbers = Math.floor(2000 + Math.random() * 5489);
//     await user.updateOne({validationcode: random4Numbers}, { runValidators: true, new: true })
//     const subject = 'OTP';
//     await otpMail(user.email, subject, user.firstname, random4Numbers);
//     req.flash('success', 'OTP sent!')
//     res.redirect(`/verify_email`);
// });

// router.post('/change_email', isLoggedIn, onlyClient, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id);
//     const random4Numbers = Math.floor(2000 + Math.random() * 5489);
//     const {email} = req.body
//     await user.updateOne({email: email, validationcode: random4Numbers}, { runValidators: true, new: true })
//     const subject = 'OTP';
//     await otpMail(email, subject, user.firstname, random4Numbers);
//     console.log(email)
//     req.flash('success', 'Email changed and OTP sent!')
//     res.redirect(`/verify_email`);
// });

// router.post('/verify_email', isLoggedIn, onlyClient, async(req, res) => {
//     const id = req.user.id;
//     const user = await Users.findById(id);
//     const {otpDigit1, otpDigit2, otpDigit3, otpDigit4} = req.body;
//     const otp = otpDigit1 + otpDigit2 + otpDigit3 + otpDigit4
//     const code = parseInt(otp)
//     if (code === user.validationcode) {
//         await user.updateOne({validateaccount: 'Yes'}, { runValidators: true, new: true })
//         res.redirect('/dashboard')
//     } else {
//         req.flash('error', 'This code is not valid.')
//         res.redirect(`/verify_email`);
//     }
    
// });

router.get('/user/kyc', isLoggedIn, onlyClient, async(req, res) => {
    const id = req.user.id
    const user = await Users.findById(id)
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render("user/kyc", {user, unreadmsg})
})

router.put('/user/kyc', isLoggedIn, onlyClient, upload.fields([
    { name: 'verificationdocument', maxCount: 1 },
    { name: 'profilepicture', maxCount: 1 }
]),  async (req, res) => {
    const id = req.user.id; 
    // const {documenttype } = req.body;
    const {email, firstname, lastname, phonenumber, country, basecurrency, basecurrencysymbol, gender, documenttype} = req.body;
    // const update = { ...req.body };
    const update = {email, firstname, lastname, phonenumber, country, basecurrency, basecurrencysymbol, gender, documenttype, verificationstatus: 'Pending'}

    // const user = await Users.findByIdAndUpdate(id, {documenttype, verificationstatus: 'Pending'}, { runValidators: true, new: true })
    const user = await Users.findByIdAndUpdate(id, update, { runValidators: true, new: true })

    if (req.files['verificationdocument']) {
        user.verificationdocument = req.files['verificationdocument'].map(f => ({ url: f.path, filename: f.filename }));
    }

    if (req.files['profilepicture']) {
        user.profilepicture = req.files['profilepicture'].map(f => ({ url: f.path, filename: f.filename }));
    }

    await user.save();
    const subject = 'USER VERIFICATION';
    await verifyMail(user.email, subject, user.firstname);
    req.flash('success', 'Verification request submitted!')
    res.redirect('/user/kyc')
});

router.get('/user/account-suspended', isLoggedIn, onlyClient, async(req, res) => {
    const id = req.user.id
    const user = await Users.findById(id)
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    if (user.acctstatus === 'Suspended'){
        res.render("user/accountsuspended", {user, unreadmsg})
    } else {
        res.redirect('/dashboard')
    }
})

router.get('/login', async(req, res) => {
    res.render('signin');
});

router.post('/login', isClient, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Successfully Logged In!');
    res.redirect('/dashboard');
})


// router.get('/password-reset', (req, res) => {
//     res.render('passwordreset');
// });


//api currently being used in dashboard
// router.get('/api/plans/:packagename', async (req, res) => {
//     try {
//       const plan = await InvestmentPlans.findOne({ packagename: 'Scalping' });
//       res.json(plan);
//     } catch (error) {
//       console.error('Error fetching plan:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

router.get('/get-currencies/:tradeType', async (req, res) => {
    const user = await Users.findById(req.user.id);
    const tradeType = req.params.tradeType;

    try {
        const trades = await Trades.find({ tradeType: tradeType, validateUser: user });
        const currencies = trades.map(trade => ({
            tradeCurrency: trade.tradeCurrency,
            tradeSymbol: trade.tradeSymbol
        }));
        res.json(currencies);
        // console.log(currencies)
    } catch (error) {
        console.error('Error fetching currencies:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/check-currency/:tradeCurrency', async (req, res) => {
    const user = await Users.findById(req.user.id);
    const tradeCurrency = req.params.tradeCurrency;
    // console.log(tradeCurrency)
    try {
        const asset = await Trades.findOne({ tradeCurrency: tradeCurrency, validateUser: user });
        if (asset) {
            res.json(asset);
            // console.log(asset)
        } else {
            res.status(404).json({ error: 'Asset not found' });
            // console.log('asset not found')
        }
    } catch (error) {
        console.error('Error fetching asset:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/dashboard/enter-trade', isLoggedIn, onlyClient, validateTrade, async(req, res) => {
    // const {walletid, planid} = req.params;
    const user = await Users.findById(req.user.id);
    const now = new Date();

    const {currency, investedamount, duration, takeprofit, stoploss, ordertype, tradetype} = req.body;

    if (tradetype === 'Stocks') {

        const wallet = await Trades.findOne({tradeSymbol: currency, validateUser: user});

        if (wallet.status === 'Active') {
            req.flash('error', 'You already have an active trade on this asset. Please select another asset.');
            res.redirect(`/dashboard`);
        } else {
            // const tradeplan = await InvestmentPlans.findOne({ packagename: 'Quick Trade' });
    
                    const newtrade = new Investment({investedamount: investedamount, investmentType: wallet.tradeType, startDate: new Date(), packagetype: ordertype, tradedCurrency: wallet.tradeCurrency,
                        duration, takeprofit, stoploss, status: 'Active', investmentprofit: 0.00, validateUser: user, validateTradeID: wallet.id});
                if (investedamount <= user.wallet) {
                    const newWalletTransaction = new Tradetracker({amount: investedamount, tradeCurrency: wallet.tradeCurrency, action: 'Trade Opened', status: "Successful", validateTrade: wallet, tradeId: wallet.id, investmentId: newtrade.id});
                    wallet.tradeTracker.push(newWalletTransaction);
                    await newWalletTransaction.save();
    
                        user.investment.push(newtrade);
                        await newtrade.save();
                        await user.save()
                        await user.updateOne({wallet: user.wallet - newtrade.investedamount}, { runValidators: true, new: true });
                        await wallet.updateOne({status: "Active", currentinvestedamount: investedamount, currentSessionID: newtrade.id }, { runValidators: true, new: true });
                        // console.log(newtrade)
                        // const subject = 'TRADE OPENED';
                        // await openInvestmentMail(user.email, subject, user.firstname, newtrade.packagetype, newtrade.investedamount);
                        // req.flash('success', 'Trade Opened')
                        res.redirect(`/dashboard/traded-asset/${newtrade.id}`);
                } else {
                        req.flash('error', 'You have insufficient funds to place this trade.');
                        res.redirect(`/dashboard`);
                } 
        }

    } else {

        const wallet = await Trades.findOne({tradeCurrency: currency, validateUser: user});

        if (wallet.status === 'Active') {
            req.flash('error', 'You already have an active trade on this asset. Please select another asset.');
            res.redirect(`/dashboard`);
        } else {
            // const tradeplan = await InvestmentPlans.findOne({ packagename: 'Quick Trade' });
    
                    const newtrade = new Investment({investedamount: investedamount, investmentType: wallet.tradeType, startDate: new Date(), packagetype: ordertype, tradedCurrency: wallet.tradeCurrency,
                        duration, takeprofit, stoploss, status: 'Active', investmentprofit: 0.00, validateUser: user, validateTradeID: wallet.id});
                if (investedamount <= user.wallet) {
                    const newWalletTransaction = new Tradetracker({amount: investedamount, tradeCurrency: wallet.tradeCurrency, action: 'Trade Opened', status: "Successful", validateTrade: wallet, tradeId: wallet.id, investmentId: newtrade.id});
                    wallet.tradeTracker.push(newWalletTransaction);
                    await newWalletTransaction.save();
    
                        user.investment.push(newtrade);
                        await newtrade.save();
                        await user.save()
                        await user.updateOne({wallet: user.wallet - newtrade.investedamount}, { runValidators: true, new: true });
                        await wallet.updateOne({status: "Active", currentinvestedamount: investedamount, currentSessionID: newtrade.id }, { runValidators: true, new: true });
                        // console.log(newtrade)
                        // const subject = 'TRADE OPENED';
                        // await openInvestmentMail(user.email, subject, user.firstname, newtrade.packagetype, newtrade.investedamount);
                        // req.flash('success', 'Trade Opened')
                        res.redirect(`/dashboard/traded-asset/${newtrade.id}`);
                } else {
                        req.flash('error', 'You have insufficient funds to place this trade.');
                        res.redirect(`/dashboard`);
                } 
        }
    }
    
    // res.send(req.body)
});

router.get('/dashboard/traded-asset/:id', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const investment = await Investment.findById(req.params.id);
    const tradeactivity  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {investmentId: investment.id}
        ]}).sort({date: -1});
    // console.log(investment)
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/dashboardtrade', {user, unreadmsg, investment, tradeactivity});
});

router.get('/dashboard', isLoggedIn, onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate('referrals');
    // const quicktrade = await InvestmentPlans.findOne({ packagename: 'Quick Trade' })
    const dashboardtrade = await Investment.find({validateUser: user, status: 'Active', packagetype: { $in: ['Buy', 'Sell'] }}).sort({startDate: -1});
    const totalinvestments = await Investment.find({validateUser: user}).sort({startDate: -1});
    const lastinvestments = await Investment.find({validateUser: user, status: 'Completed'}).sort({startDate: -1});
    // const tradingplans = await InvestmentPlans.find({}).sort({minamount: 1});
    const deposits = await Transaction.find({validateUser: user, transactionType: 'Deposit'}).sort({transactiondate: -1});
    const withdrawal = await Transaction.find({validateUser: user, transactionType: 'Withdraw'}).sort({transactiondate: -1});
    const lastdeposit = await Transaction.findOne({validateUser: user, transactionType: 'Deposit'}).sort({transactiondate: -1});
    const lastwithdrawal = await Transaction.findOne({validateUser: user, transactionType: 'Withdraw', status: 'Successful'}).sort({transactiondate: -1});
    const pendingwithdrawal = await Transaction.findOne({validateUser: user, transactionType: 'Withdraw', status: 'Pending'}).sort({transactiondate: -1});
    // const alltrades  = await Trades.find({validateUser: user}).sort({tradeCurrency: 1});
    const alltrades  = await Trades.find({
        $and: [
            {tradeType: { $in: ["Stocks", "Crypto"]}},
            {validateUser: user}
        ]}).sort({tradeType: 1});
    const cryptotrades = await Trades.find({tradeType: 'Crypto', validateUser: user});
    const trades = await Trades.find({tradeType: 'Crypto', validateUser: user});
        // console.log(trades)
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/dashboard', {user, lastdeposit, cryptotrades, lastwithdrawal, pendingwithdrawal, deposits, withdrawal, dashboardtrade, lastinvestments, totalinvestments, unreadmsg, alltrades});
});

router.get('/profile', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    // const now = new Date();
    // const dat = new Date(now.getTime() + 3 * 60 * 1000);
    // console.log(dat)
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/accountprofile', {user, unreadmsg});
});

router.put('/user/:id/changepassword', isLoggedIn, onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id)
    const {currentpassword, password, confirmpassword} = req.body;

    const validPassword = await bcrypt.compare(currentpassword, user.password);
    if(validPassword) {
        if(password === confirmpassword) {
            const hashedpassword = await bcrypt.hash(password, 12);
            await user.updateOne({password: hashedpassword, confirmpassword: confirmpassword}, { runValidators: true, new: true })

            req.login(user, function(err) {
                if (err) return next(err);
                req.flash('success', 'Password Changed!');
                res.redirect('/dashboard');
            })
        } else {
            req.flash('error', 'Passwords do not match.')
            res.redirect(`/dashboard/changepassword`)
        }
    } else {
        req.flash('error', 'Incorrect Password.')
        res.redirect(`/dashboard/changepassword`)
    }
});

router.put('/dashboard/profile/:id', isLoggedIn, onlyClient, async(req, res) => {
    const id = req.user.id;
    const {email, firstname, lastname, username, phonenumber, country, basecurrency, basecurrencysymbol, state, address, gender} = req.body;
    const user = { ...req.body };
    
    const saveUser = await Users.findByIdAndUpdate(id, user, { runValidators: true, new: true })
    req.flash('success', 'Successfully Updated Profile!')
    res.redirect(`/profile`);
});

router.put('/verify/:id', isLoggedIn, onlyClient, upload.array('verificationdocument'), async (req, res) => {
    const id = req.user.id; 
    const {documenttype } = req.body;
    // const updateuser = {verificationstatus: 'Pending', documenttype};
    const user = await Users.findByIdAndUpdate(id, {documenttype, verificationstatus: 'Pending'}, { runValidators: true, new: true })
    user.verificationdocument =  req.files.map(f => ({url: f.path, filename: f.filename}))
    await user.save();
    const subject = 'USER VERIFICATION';
    await verifyMail(user.email, subject, user.firstname);
    req.flash('success', 'Successfully Submitted Document!')
    res.redirect('/dashboard')
});

router.put('/upload-profile-picture', isLoggedIn, onlyClient,  upload.array('profilepicture'), async (req, res) => {
    const id = req.user.id;
    const {profilepicture } = req.body;
    const user = await Users.findByIdAndUpdate(id, {profilepicture}, { runValidators: true, new: true })
    user.profilepicture = req.files.map(f => ({url: f.path, filename: f.filename}))
    await user.save();
    req.flash('success', 'Successfully Uploaded Profile Picture!')
    res.redirect('/profile')
});

router.put('/delete-profile-picture', isLoggedIn, onlyClient,  upload.array('profilepicture'), async (req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id)
    for (let filename of user.profilepicture) {
        await cloudinary.uploader.destroy(filename);
    }
    await user.updateOne({ $pull: { profilepicture: { } } })
    await user.save();
    req.flash('success', 'Successfully Deleted Profile Picture!')
    res.redirect('/profile')
});

router.get('/notifications', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id)
    const msg = await Notification.find({validateUser: user}).sort({notificationdate: -1});
    const openedmsg = await Notification.find({validateUser: user, status: 'Read'})
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/notification', {user, unreadmsg, msg, openedmsg, unreadmsg});
});

router.get('/dashboard/notification/:id', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const notification = await Notification.findById(req.params.id);
    if (notification.status === 'Unread') {
        await notification.updateOne({status: 'Read'}, { runValidators: true, new: true });
    }
    // console.log(notification)
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/notificationshow', {user, unreadmsg, notification});
});



router.get('/dashboard/deposit', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposits = await Transaction.find({validateUser: user, transactionType: 'Deposit'}).sort({transactiondate: -1});
    const depositmethods  = await Depositmethods.find({});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/deposit', {user, unreadmsg, depositmethods, deposits });
});

router.get('/api/depositmethods/:packagename', async (req, res) => {
    try {
      const depositmethod = await Depositmethods.findOne({depositmethodname: req.params.packagename});
      res.json(depositmethod);
    } catch (error) {
      console.error('Error fetching deposit method:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

router.post('/dashboard/deposit', isLoggedIn, onlyClient, checkAcct, upload.array('transactionproof'), async(req, res) => {
    const id  = req.user.id;
    const user = await Users.findById(id);
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {depositmethodname, depositaddress, amount, transactionproof} = req.body;
    const deposit = new Transaction({transactionmethod: depositmethodname, amount, transactiondate: dateTime, transactionType: 'Deposit', companywallet: depositaddress, paymentstatus: 'Completed', validateUser: user, transactionproof});
    deposit.transactionproof =  req.files.map(f => ({url: f.path, filename: f.filename}))
    user.transaction.push(deposit);
    await deposit.save();
    await user.save()
    req.flash('success', 'Deposit receipt submitted. Please hold while we confirm your deposit.')
    res.redirect(`/dashboard/deposit`);
});
  

// router.post('/dashboard/deposits', isLoggedIn, onlyClient, checkAcct, async(req, res) => {
//     const id  = req.user.id;
//     const user = await Users.findById(id);
//         const today = new Date();
//         const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//         const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
//         const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
//         const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
//         const dateTime = date+' '+time+ ' ' + ampm;
//     const {transactionmethod, amount} = req.body;
//     const deposit = new Transaction({transactionmethod, amount, transactiondate: dateTime, transactionType: 'Deposit', validateUser: user});
//     user.transaction.push(deposit);
//     await deposit.save();
//     await user.save()
//     res.redirect(`/dashboard/deposits/payment/${deposit.id}`);
// });

router.get('/dashboard/deposits/payment/:id', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const userid = req.user.id;
    const transactionid = req.params.id;
    const deposit = await Transaction.findById(transactionid);
    const user = await Users.findById(userid);
    const transactionMethod = deposit.transactionmethod;
    const depositmethod  = await Depositmethods.findOne({depositmethodname: `${transactionMethod}`});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/payment', {user, unreadmsg, deposit, depositmethod});
});

router.get('/dashboard/deposits/upload/:id', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposit = await Transaction.findById(req.params.id);
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/depositupload', {user, unreadmsg, deposit});
});

router.get('/dashboard/upgrade-account', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposits = await Transaction.find({validateUser: user, transactionType: 'Upgrade Fee'}).sort({transactiondate: -1});
    const upgradeplans  = await Plans.find({planType: 'Account Upgrade'});
    const depositmethods  = await Depositmethods.find({});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/accountupgrade', {user, unreadmsg, depositmethods, deposits, upgradeplans});
});

router.get('/api/upgrade-plans/:packagename', async (req, res) => {
    try {
      const plan = await Plans.findOne({ name: req.params.packagename });
      res.json(plan);
    } catch (error) {
      console.error('Error fetching plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

router.post('/dashboard/upgrade-account', isLoggedIn, onlyClient,  upload.array('transactionproof'), async (req, res) => {
    // const id = req.params.id; 
    const user = await Users.findById(req.user.id);

    // const {transactionproof, address, narration} = req.body;

    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
    const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
    const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
    const dateTime = date+' '+time+ ' ' + ampm;

    const {depositmethodname, depositaddress, amount, accounttype, transactionproof} = req.body;

    const upgradeplan = await Plans.findOne({name: accounttype });


    const deposit = new Transaction({transactionmethod: depositmethodname, amount: upgradeplan.amount, narration: upgradeplan.name, transactiondate: dateTime, transactionType: 'Upgrade Fee', companywallet: depositaddress, paymentstatus: 'Completed', validateUser: user, transactionproof});
    deposit.transactionproof =  req.files.map(f => ({url: f.path, filename: f.filename}))
    user.transaction.push(deposit);
    await deposit.save();
    await user.save()

    req.flash('success', 'Account upgrade request submitted. Your account will be upgraded as soon as we confirm your payment.')
    res.redirect('/dashboard/upgrade-account')
});

router.get('/dashboard/trading-bots', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposits = await Transaction.find({validateUser: user, transactionType: 'Signal Fee'}).sort({transactiondate: -1});
    const signalplans  = await Plans.find({planType: 'Signal'});
    const activesignal = await Plans.findById(user.subscribedSignalId)
    const depositmethods  = await Depositmethods.find({});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/signal', {user, unreadmsg, depositmethods, deposits, signalplans, activesignal});
});

router.post('/dashboard/signal/:id', isLoggedIn, onlyClient,  upload.array('transactionproof'), async (req, res) => {
    // const id = req.params.id; 
    const user = await Users.findById(req.user.id);
    const signalplan = await Plans.findById(req.params.id);
    // const {transactionproof, address, narration} = req.body;

    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
    const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
    const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
    const dateTime = date+' '+time+ ' ' + ampm;

    const {depositmethodname, depositaddress, transactionproof} = req.body;

    const deposit = new Transaction({transactionmethod: depositmethodname, amount: signalplan.amount, narration: signalplan.name, transactiondate: dateTime, transactionType: 'Signal Fee', companywallet: depositaddress, paymentstatus: 'Completed', validateUser: user, transactionproof});
    deposit.transactionproof =  req.files.map(f => ({url: f.path, filename: f.filename}))
    user.transaction.push(deposit);
    await deposit.save();
    await user.save()
    req.flash('success', 'Trading bot subscription request submitted. You will be subscribed to this bot as soon as we confirm your payment.')
    res.redirect('/dashboard/trading-bots')
    
});



router.get('/dashboard/subscription', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposits = await Transaction.find({validateUser: user, transactionType: 'Subscription Fee'}).sort({transactiondate: -1});
    const subscriptionplans  = await Plans.find({planType: 'Investment'});
    const activesubscription = await Plans.findById(user.subscribedSubscriptionId)
    const depositmethods  = await Depositmethods.find({});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/subscription', {user, unreadmsg, depositmethods, deposits, subscriptionplans, activesubscription});
});

router.post('/dashboard/subscription/:id', isLoggedIn, onlyClient,  upload.array('transactionproof'), async (req, res) => {
    // const id = req.params.id; 
    const user = await Users.findById(req.user.id);
    const subscriptionplan = await Plans.findById(req.params.id);

    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
    const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
    const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
    const dateTime = date+' '+time+ ' ' + ampm;

    const {depositmethodname, depositaddress, transactionproof, amount} = req.body;
    if (amount >= subscriptionplan.minamount && amount <= subscriptionplan.maxamount) {

        const deposit = new Transaction({transactionmethod: depositmethodname, amount, narration: subscriptionplan.name, transactiondate: dateTime, transactionType: 'Subscription Fee', companywallet: depositaddress, paymentstatus: 'Completed', validateUser: user, transactionproof});
        deposit.transactionproof =  req.files.map(f => ({url: f.path, filename: f.filename}))
        user.transaction.push(deposit);
        await deposit.save();
        await user.save()
    
        req.flash('success', 'Subscription request submitted. Your subscription will be updated as soon as we confirm your payment.')
        res.redirect('/dashboard/subscription')

    } else {
        req.flash('error', `Amount needs to be within $${subscriptionplan.minamount.toLocaleString()} - $${subscriptionplan.maxamount.toLocaleString()}`);
        res.redirect('/dashboard/subscription');
    }

});

router.get('/dashboard/withdrawal', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const withdrawal = await Transaction.find({validateUser: user, transactionType: 'Withdraw'}).sort({transactiondate: -1});
    const depositmethods  = await Depositmethods.find({});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/withdrawal', {user, unreadmsg, withdrawal, depositmethods});
});

// router.post('/dashboard/withdrawal', isLoggedIn, onlyClient, checkAcct, validateWithdrawal, async(req, res) => {
//     const id  = req.user.id;
//     const user = await Users.findById(id);
//         const today = new Date();
//         const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//         const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
//         const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
//         const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
//         const dateTime = date+' '+time+ ' ' + ampm;
//     const {transactionmethod, amount} = req.body;
//     const withdraw = new Transaction({transactionmethod, transactiondate: dateTime, transactionType: 'Withdraw', validateUser: user, amount, });
//     if (amount <= user.wallet) {
//         user.transaction.push(withdraw);
//         await withdraw.save();
//         await user.save()
//         res.redirect(`/dashboard/withdrawal/${withdraw.id}`);
//     } else {
//         req.flash('error', 'Insufficient Balance');
//         res.redirect('/dashboard/withdrawal');
//     }
    
// });

router.post('/dashboard/withdrawal', isLoggedIn, onlyClient, checkAcct, validateWithdrawal, async(req, res) => {
    const id  = req.user.id;
    const user = await Users.findById(id);
    // console.log(user.wallet)
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {transactionmethod, amount, withdrawaddress, bankname, accountnumber, routingnumber, routingcode} = req.body;
    // console.log(req.body)
    const withdraw = new Transaction({transactionmethod, withdrawaddress, amount, bankname, accountnumber, routingnumber, routingcode, transactiondate: dateTime, transactionType: 'Withdraw', paymentstatus: 'Completed', validateUser: user});
    if (amount <= user.wallet) {
        user.transaction.push(withdraw);
        await withdraw.save();
        await user.save()
        req.flash('success', 'Withdrawal request submitted.');
        res.redirect(`/dashboard/withdrawal`);
    } else {
        req.flash('error', 'Insufficient Balance');
        res.redirect('/dashboard/withdrawal');
    }
    
});

router.get('/dashboard/withdrawal/:id', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const withdraw = await Transaction.findById(req.params.id);
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/withdraw2', {user, unreadmsg, withdraw});
});

//yield farming

// router.get('/dashboard/trade-center', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const user = await Users.findById(req.user.id).populate({path: 'investment', options: { sort: { 'investmentstartdate': -1 } } })
//     const alltrades = await Investment.find({validateUser: user});
//     const activetrades = await Investment.find({validateUser: user, status: 'Active'});
//     const closedtrades = await Investment.find({validateUser: user, status: 'Completed'});
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('user/investment', {user, unreadmsg, activetrades, alltrades, closedtrades});
// });

// router.get('/dashboard/trading-plans', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
//     const user = await Users.findById(req.user.id);
//     const tradingplans = await InvestmentPlans.find({}).sort({duration: 1});
//     console.log(tradingplans)
//     const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
//     res.render('user/investmentpackages', {user, unreadmsg, tradingplans});
// });

// router.post('/dashboard/trading-plans/:id', isLoggedIn, onlyClient, checkAcct, async(req, res) => {
//     const user = await Users.findById(req.user.id);
//     const now = new Date();
//     const investmentplan = await InvestmentPlans.findById(req.params.id);

//     const {investedamount} = req.body;

//     const investment = new Investment({investedamount, investmentstartdate: new Date(), packagetype: investmentplan.packagename,
//           duration: investmentplan.duration, roi: investmentplan.roi, charges: investmentplan.charges, status: 'Active', investmentprofit: 0.00, validateUser: user  });
//     if (investedamount <= user.wallet) {
//         if (investedamount >= investmentplan.minamount && investedamount <= investmentplan.maxamount) {

//             const priceUpdateTime = new Date(now.getTime() + 60 * 60 * 1000)
            
//             const renderTimezone = 'America/Los_Angeles';
//             const utcTime = moment.utc(priceUpdateTime);
//             const renderConvertedTime = utcTime.tz(renderTimezone);
            
//             investment.nextPriceUpdate = renderConvertedTime;
//             user.investment.push(investment);
//             await investment.save();
//             await user.save()
//             await user.updateOne({wallet: user.wallet - investment.investedamount}, { runValidators: true, new: true });
//             const subject = 'TRADE OPENED';
//             // await openInvestmentMail(user.email, subject, user.firstname, investment.packagetype, investment.investedamount);
//             req.flash('success', 'Trade Opened')
//             res.redirect(`/dashboard/trade/${investment.id}`);
//         } else {
//             req.flash('error', `Investment amount needs to be above $${investmentplan.minamount.toLocaleString()} and below $${investmentplan.maxamount.toLocaleString()}`);
//             res.redirect('/dashboard/trading-plans');
//         }
//     } else {
//         req.flash('error', 'Insufficient wallet balance');
//         res.redirect('/dashboard/trading-plans');
//     } 
// });

router.get('/dashboard/trade/:id', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const investment = await Investment.findById(req.params.id);
    // const totalincome = parseInt(investment.investedamount) + parseInt(investment.investmentprofit);
    const tradeactivity  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {investmentId: investment.id}
        ]}).sort({date: -1});
    
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/investment-show', {user, unreadmsg, investment, tradeactivity});
});

router.get('/dashboard/copy-experts', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const experttraders = await Managers.find().populate('subscribers');
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/copyexperts', {user, experttraders, unreadmsg});
});

router.put('/dashboard/copy-expert/:id', isLoggedIn, onlyClient, async (req, res) => {
    const traderID = req.params.id
    const user = await Users.findById(req.user.id);
    const trader = await Managers.findById(traderID)
    if (user.accountManagerId === undefined || user.accountManagerId === null ) {
        await user.updateOne({accountManagerId: traderID}, { runValidators: true, new: true });
        await trader.updateOne({numberofsubscribers: trader.numberofsubscribers + 1}, { runValidators: true, new: true });
        req.flash('success', 'You have suscribed to an expert trader.')
        res.redirect('/dashboard/copy-experts')
    } else {
    
        req.flash('error', 'You are already suscribed to an expert trader.')
        res.redirect('/dashboard/copy-experts')
    }
});

router.put('/dashboard/copy-expert/:id/unsubscribe', isLoggedIn, onlyClient, async (req, res) => {
    const traderID = req.params.id
    const user = await Users.findById(req.user.id);
    const trader = await Managers.findById(traderID)
    await user.updateOne({accountManagerId: null}, { runValidators: true, new: true });
    await trader.updateOne({numberofsubscribers: trader.numberofsubscribers - 1}, { runValidators: true, new: true });
    req.flash('success', 'You have unsuscribed from this expert trader.')
    res.redirect('/dashboard/copy-experts')
});


router.get('/dashboard/real-estate', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const projects = await Investment.find({validateUser: user, investmentType: 'Real Estate'}).sort({startDate: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})

    res.render('user/realestate', {user, projects, unreadmsg});
});

router.post('/dashboard/real-estate', isLoggedIn, onlyClient, checkAcct, validateTrade, async(req, res) => {
    const user = await Users.findById(req.user.id); 
    const now = new Date();

    const {currency, amount, roi, duration, expectedincome, minamount} = req.body;

    const validatedamount = parseInt(amount)

            const newtrade = new Investment({investedamount: amount, investmentType: 'Real Estate', startDate: new Date(), tradedCurrency: currency,
                duration, roi, expectedincome, status: 'Active', investmentprofit: 0.00, validateUser: user});
        
        if (validatedamount <= user.wallet) {
            if (validatedamount >= minamount) {
                user.investment.push(newtrade);
                await newtrade.save();
                await user.save()
                await user.updateOne({wallet: user.wallet - newtrade.investedamount}, { runValidators: true, new: true });
                res.redirect(`/dashboard/project/${newtrade.id}`);
            } else {
                req.flash('error', `Amount needs to be above $${minamount.toLocaleString()}`);
                res.redirect(`/dashboard/real-estate`);
            }
        } else {
            req.flash('error', `Insufficient account balance`);
            res.redirect(`/dashboard/real-estate`);
        }
});

router.get('/dashboard/project-1', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const projects = await Investment.find({validateUser: user, investmentType: 'Real Estate'}).sort({startDate: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})

    res.render('user/project1', {user, projects, unreadmsg});
});

router.get('/dashboard/project-2', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const projects = await Investment.find({validateUser: user, investmentType: 'Real Estate'}).sort({startDate: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})

    res.render('user/project2', {user, projects, unreadmsg});
});

router.get('/dashboard/project-3', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const projects = await Investment.find({validateUser: user, investmentType: 'Real Estate'}).sort({startDate: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})

    res.render('user/project3', {user, projects, unreadmsg});
});

router.get('/dashboard/project-4', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const projects = await Investment.find({validateUser: user, investmentType: 'Real Estate'}).sort({startDate: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})

    res.render('user/project4', {user, projects, unreadmsg});
});

router.get('/dashboard/project-5', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const projects = await Investment.find({validateUser: user, investmentType: 'Real Estate'}).sort({startDate: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})

    res.render('user/project5', {user, projects, unreadmsg});
});

router.get('/dashboard/project-6', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const projects = await Investment.find({validateUser: user, investmentType: 'Real Estate'}).sort({startDate: -1});
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})

    res.render('user/project6', {user, projects, unreadmsg});
});

router.get('/dashboard/project/:id', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const investment = await Investment.findById(req.params.id);
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/project', {user, unreadmsg, investment});
});


router.get('/dashboard/stake', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    const investments = await Investment.find({validateUser: user, investmentType: 'Staking'}).sort({startDate: -1});
    res.render('user/stake', {user, unreadmsg, investments});
});

router.post('/dashboard/stake', isLoggedIn, onlyClient, checkAcct, validateTrade, async(req, res) => {
    const user = await Users.findById(req.user.id); 
    const now = new Date();

    const {currency, amount, roi, duration, expectedincome} = req.body;

    const validatedamount = parseInt(amount)

            const newtrade = new Investment({investedamount: amount, investmentType: 'Staking', startDate: new Date(), tradedCurrency: currency,
                duration, roi, expectedincome, status: 'Active', investmentprofit: 0.00, validateUser: user});
        
        if (validatedamount <= user.wallet) {
            if (validatedamount >= 5000) {
                user.investment.push(newtrade);
                await newtrade.save();
                await user.save()
                await user.updateOne({wallet: user.wallet - newtrade.investedamount}, { runValidators: true, new: true });
                res.redirect(`/dashboard/staked-asset/${newtrade.id}`);
            } else {
                req.flash('error', `Amount needs to be above $5,000`);
                res.redirect(`/dashboard/stake`);
            }
        } else {
            req.flash('error', `Insufficient account balance`);
            res.redirect(`/dashboard/stake`);
        }
});

router.get('/dashboard/staked-asset/:id', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const investment = await Investment.findById(req.params.id);
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/stakedasset', {user, unreadmsg, investment});
});

router.get('/dashboard/referral-dashboard', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate('referrals');
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/affiliate', {user, unreadmsg});
});

router.put('/dashboard/referral-dashboard', isLoggedIn, onlyClient, async (req, res) => {
    const user = await Users.findById(req.user.id);
    if (user.referralincomes > 0 ) {
        await user.updateOne({wallet: user.wallet + user.referralincomes, referralincomes: 0}, { runValidators: true, new: true });
        req.flash('success', `Successfully transferred referral incomes to main wallet.`)
        res.redirect(`/dashboard/referral-dashboard`)
    } else {
        req.flash('error', `Referral wallet is empty!`)
        res.redirect(`/dashboard/referral-dashboard`)
    }
    
});

router.get('/register/:id', async(req, res) => {
    const user = await Users.findById(req.params.id);
    res.render('user/refregister', {user});
});

router.post('/register/:id', recaptcha.middleware.verify, async(req, res) => {
    const referedid = await Users.findById(req.params.id);
    if (!req.recaptcha.error) {
        try {
                const random8Numbers = Math.floor(20000000 + Math.random() * 54890765);
                const random4Numbers = Math.floor(2000 + Math.random() * 5489);

            const { email, country, basecurrency, basecurrencysymbol, gender, firstname, lastname, phonenumber, password, confirmpassword, accessCode } = req.body;
            const existingUser = await Users.findOne({email: email });
            if (existingUser) {
                req.flash('error', 'Email already in use. Please enter another email or sign in.');
                res.redirect(`/register/${req.params.id}`);
            } else {
            
                const registeredUser = new Users({
                    email, country, basecurrency, basecurrencysymbol, gender, firstname, lastname, phonenumber, confirmpassword, accessCode, 
                    referralincomes: 0, wallet: 0, totalprofits: 0, uid: random8Numbers, validationcode: random4Numbers
                });

                    if (confirmpassword == password) {

                        const hashedpassword = await bcrypt.hash(password, 12);
                        registeredUser.password = hashedpassword;

                            const enumData = ['GBPUSD', 'GBPJPY', 'GBPCHF', 'EURUSD', 'EURJPY', 'EURAUD', 'EURCAD', 'EURGBP', 'EURCHF',  
                                        'USDCHF', 'NZDUSD', 'AUDCAD',  'AUDNZD', 'AUDJPY', 'AUDUSD',];
                            async function createTrades(registeredUser) {
                            const trades = [];
                            for (const tradeCurrency of enumData) {
                                const newTrade = new Trades({ tradeCurrency, tradeSymbol: tradeCurrency, tradeType: 'Forex', userFirstname: registeredUser.firstname, userLastname: registeredUser.lastname, userEmail: registeredUser.email, userId: registeredUser.id, validateUser: registeredUser});
                                trades.push(newTrade);
                            }
                            try {
                                await Promise.all(trades.map(trade => trade.save()));
                                    console.log('Forex Trades created successfully!');
                                } catch (error) {
                                    console.error('Error creating forex trades:', error);
                                }
                            }
                            // createTrades(registeredUser);
                            const savetrade = await createTrades(registeredUser);


                            const enumData2 = ['Google', 'Apple', 'Pepsico', 'Tesla', 'Amazon', 'Microsoft', 'Disney', 'Netflix', 'Cisco', 'Snap Inc', 'Mastercard', 'Coca Cola', 'American Express'];
                            const enumData2Symbol = ['GOOGL', 'AAPL', 'PEP', 'TSLA', 'AMZN', 'MSFT', 'DIS', 'NFLX', 'CSCO', 'SNAP', 'MA', 'KO', 'AXP'];
                            async function createTrades2(registeredUser) {
                            const trades = [];
                            for (let x = 0; x < enumData2.length; x++) {
                                const newTrade = new Trades({ tradeCurrency: enumData2[x], tradeSymbol: enumData2Symbol[x], tradeType: 'Stocks', userFirstname: registeredUser.firstname, userLastname: registeredUser.lastname, userEmail: registeredUser.email, userId: registeredUser.id, validateUser: registeredUser});
                                trades.push(newTrade);
                            }
                            try {
                                await Promise.all(trades.map(trade => trade.save()));
                                    console.log('Stocks Trades created successfully!');
                                } catch (error) {
                                    console.error('Error creating Stocks trades:', error);
                                }
                            }
                            // createTrades2(registeredUser);
                            const savetrade2 = await createTrades2(registeredUser);

                            
                            enumData4 = ['Bitcoin', 'Ethereum', 'Litecoin', 'Polygon', 'Dash', 'Orion Protocol', 'Tether', 'USD Coin', 'Polkadot', 'Ripple', 'Cardano', 'Dogecoin', 'Solana', 'Aurora', 'Boring DAO', 'Bitcoin Cash', 'AAVE', 'Shiba Inu', 'Dai', 'Origin Protocol', 'Tron' ]
                            enumData4Symbol = ['BTC', 'ETH', 'LTC', 'MATIC', 'DASH', 'ORN', 'USDT', 'USDC', 'DOT', 'XRP', 'ADA', 'DOGE', 'SOL', 'AURORA', 'BORING', 'BCH', 'AAVE', 'SHIB', 'DAI', 'OGN', 'TRX' ]
                            async function createTrades4(registeredUser) {
                                const trades = [];
                                for (let x = 0; x < enumData4.length; x++) {
                                    const newTrade = new Trades({ tradeCurrency: enumData4[x], tradeSymbol: enumData4Symbol[x], tradeType: 'Crypto', userFirstname: registeredUser.firstname, userLastname: registeredUser.lastname, userEmail: registeredUser.email, userId: registeredUser.id, validateUser: registeredUser});
                                    trades.push(newTrade);
                                }
                                try {
                                    await Promise.all(trades.map(trade => trade.save()));
                                        console.log('Crypto Trades created successfully!');
                                    } catch (error) {
                                        console.error('Error creating Crypto trades:', error);
                                    }
                                }
                                // createTrades4(registeredUser);
                                const savetrade4 = await createTrades4(registeredUser);

                        await registeredUser.save();
                        await referedid.updateOne({referralincomes: referedid.referralincomes + 80}, { runValidators: true, new: true })
                        const referral = new Referral({firstname: registeredUser.firstname, lastname: registeredUser.lastname, email: registeredUser.email});
                        referedid.referrals.push(referral);
                        await referral.save();
                        await referedid.save()
                        
                        const subject = 'SIGNUP SUCCESS!!';
                        await welcomeMail(registeredUser.email, subject, registeredUser.firstname, random4Numbers);
                        req.login(registeredUser, err => {
                            if (err) return next(err);
                            req.flash('success', 'Welcome!!');
                            res.redirect('/dashboard');
                        })
                    } else {
                        req.flash('error', 'Password and Confirm Password does not match');
                        res.redirect(`/register/${req.params.id}`);
                    }    
                
                }
        } catch (e) {
            req.flash('error', e.message);
            res.redirect(`/register/${req.params.id}`);
        }
    } else {
        // CAPTCHA verification failed
        // res.render('signup', { error: 'CAPTCHA verification failed. Please try again.' });
        req.flash('error', 'CAPTCHA verification failed. Please try again.');
        res.redirect(`/register/${req.params.id}`);
    }
   
});




router.get('/dashboard/review', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id).populate({path: 'reviews', options: { sort: { 'reviewdate': -1 } } })
    const allreviews = await Reviews.find({});
    res.render('user/reviews', {user, allreviews});
});

router.post('/dashboard/review', isLoggedIn, onlyClient, checkAcct, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
    const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
    const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
    const dateTime = date+' '+time+ ' ' + ampm;
    const {comment} = req.body;
    const review = new Reviews({comment, reviewdate: dateTime, username: user.firstname});
    user.reviews.push(review);
    await review.save();
    await user.save()
    req.flash('success', 'Review Submitted')
    res.redirect(`/dashboard/review/`);
});

router.delete('/dashboard/review/:id',  isLoggedIn, onlyClient, checkAcct, async (req, res) => {
    const  id  = req.params.id;
    await Reviews.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted review.')
    res.redirect('/dashboard/review')
});

router.get('/dashboard/support', isLoggedIn,  onlyClient, checkAcct, async(req, res) => {
    const id = req.user.id;
    // const user = await Users.findById(id).populate({path: 'reviews', options: { sort: { 'reviewdate': -1 } } })
    const user = await Users.findById(id);
    const unreadmsg = await Notification.find({validateUser: user, status: 'Unread'})
    res.render('user/support', {user, unreadmsg});
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            // Handle the error if needed
            return next(err);
        }
        res.redirect('/login');
    });
});



module.exports = router;

//End of Routes//