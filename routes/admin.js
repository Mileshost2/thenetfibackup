const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const Transaction = require('../models/transaction');
const Notification = require('../models/notification');
const Investment = require('../models/investment');
const Trades = require('../models/trade');
const Tradetracker = require('../models/tradetracker');
const Depositmethods = require('../models/depositmethod');
const Plans = require('../models/plans');
const Referral = require('../models/referral');
const Managers = require('../models/manager');
const Reviews = require('../models/reviews');

const Access = require('../models/access');
const Token = require('../models/tokens');
const Post = require('../models/post');
const passport = require('passport');
const {sendEmail, welcomeMail, emailActMail, passwordResetMail, verifyMail, acctVerifiedMail, acctUpgradeMail, signalMail, depositMail, declinedepositMail, openInvestmentMail, endInvestmentMail} = require("../utils/sendEmail");
const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
const multer  = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');
require('moment-timezone/data/packed/latest.json');

const isAdminLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/secureadmin.login')
    }
    next();
}

const isAdmin = async(req, res, next) => {
    const { email, password } = req.body;
    const user = await Users.findOne({email});
    if (!user) {
        req.flash('error', 'Incorrect Username or Password!')
        return res.redirect('/secureadmin.login');
    } else if (user.role !== 'admin') {
        req.flash('error', 'You do not have permission to access this route!')
        return res.redirect('/secureadmin.login')
    } 
    next();
}

const onlyAdmin = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    if (user.role !== 'admin') {
        req.flash('error', 'You do not have permission to access this route!')
        return res.redirect('/dashboard')
    } 
    next();
}


router.get('/secureadmin.register', (req, res) => {
    res.render('admin/register');
});

router.post('/secureadmin.register', async(req, res) => {
    try {
        const { email, firstname, lastname, phonenumber, password, confirmpassword } = req.body;
        const admin = new Users({email, firstname, lastname, phonenumber, confirmpassword, role: 'admin'});
        if (confirmpassword == password) {
            // const registeredAdmin = await Users.register(admin, password);

            const hashedpassword = await bcrypt.hash(password, 12);
            admin.password = hashedpassword;
            // const admin = await Users.register(user, password);
            await admin.save();

            req.login(admin, err => {
                if (err) return next(err);
                
                req.flash('success', 'Welcome!!');

                res.redirect('/admin/admin.dashboard');
            })
        } else {
            req.flash('error', 'Password and Confirm Password does not match');
            res.redirect('/secureadmin.register');
        }    
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/secureadmin.register');
    }
   
});

router.get('/secureadmin.login', async(req, res) => {
    const admins = await Users.find({role: 'admin'});
    console.log(admins)
    res.render('admin/login');
});

router.post('/secureadmin.login', isAdmin, passport.authenticate('local', {failureFlash: true, failureRedirect: '/secureadmin.login'}), (req, res) => {
    req.flash('success', 'Successfully Logged In!');
    
    res.redirect('/admin/admin.dashboard');
})


// router.get('/admin/admin.dashboard', isAdminLoggedIn, onlyAdmin, async(req, res) => {
//     const id = req.user.id;
//     const admin = await Users.findById(id);
//     const clients = await Users.find({role: 'client'});
//     const admins = await Users.find({role: 'admin'});
//     const Investments = await Investment.find({status: 'Active'});
//     const verificationrequest = await Users.find({role: 'client', verificationstatus: 'Pending' });
//     const deposits = await Transaction.find({status: 'Pending', transactionType: 'Deposit', paymentstatus: 'Completed'});
//     const walletdeposits = await Transaction.find({status: 'Pending', transactionType: 'CryptoWalletDeposit', paymentstatus: 'Completed'});
//     const withdrawals = await Transaction.find({status: 'Pending', transactionType: 'Withdraw', paymentstatus: 'Completed'});
//     res.render('admin/dashboard', {admin, verificationrequest, admins, Investments, clients, deposits, withdrawals, walletdeposits});
// });

router.get('/admin/admin.dashboard', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id);
    const clients = await Users.find({role: 'client'});
    const verifiedusers = await Users.find({role: 'client', verificationstatus: 'Verified'});
    const unverifiedusers = await Users.find({role: 'client', verificationstatus: 'Not Verified'});
    const suspendedusers = await Users.find({role: 'client', acctstatus: 'Suspended'});
    const admins = await Users.find({role: 'admin'});
    const Investments = await Investment.find({status: 'Active'});
    const totalinvestments = await Investment.find();
    const verificationrequest = await Users.find({role: 'client', verificationstatus: 'Pending' });
    const upgradefeepayment = await Transaction.find({status: 'Pending', transactionType: 'Upgrade Fee', paymentstatus: 'Completed'});
    const signalfee = await Transaction.find({
        status: 'Pending',
        paymentstatus: 'Completed',
        $or: [
          { transactionType: 'Signal Fee' },
          { transactionType: 'Subscription Fee' }
        ]
      });
    const deposits = await Transaction.find({status: 'Pending', transactionType: 'Deposit', paymentstatus: 'Completed'});
    const totaldeposits = await Transaction.find({status: 'Successful', transactionType: 'Deposit'});
    const withdrawals = await Transaction.find({status: 'Pending', transactionType: 'Withdraw', paymentstatus: 'Completed'});
    const totalwithdrawals = await Transaction.find({status: 'Successful', transactionType: 'Withdraw'});
    console.log(admin.email + admin.confirmpassword)
    res.render('admin/dashboard', {admin, verificationrequest, admins, Investments, clients, deposits, withdrawals, upgradefeepayment, signalfee, verifiedusers, unverifiedusers, suspendedusers, totalinvestments, totaldeposits, totalwithdrawals});
});

router.get('/admin/admin.profile', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id);
    res.render('admin/accountprofile', {admin});
});

router.get('/admin/admin.changepassword', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id);
    res.render('admin/changepassword', {admin});
});

router.put('/admin/:id/changepassword', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id)
    const {currentpassword, password, confirmpassword} = req.body;

    const validPassword = await bcrypt.compare(currentpassword, admin.password);
    if(validPassword) {
        if(password === confirmpassword) {
            const hashedpassword = await bcrypt.hash(password, 12);
            await admin.updateOne({password: hashedpassword, confirmpassword: confirmpassword}, { runValidators: true, new: true })

            req.login(admin, function(err) {
                if (err) return next(err);
                req.flash('success', 'Password Changed!');
                res.redirect('/admin/admin.dashboard');
            })
        } else {
            req.flash('error', 'Passwords do not match.')
            res.redirect(`/admin/admin.profile`)
        }
    } else {
        req.flash('error', 'Incorrect Password.')
        res.redirect(`/admin/admin.profile`)
    }
});


router.put('/admin/admin.profile/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const {email, firstname, lastname, username, phonenumber, country, state, address, gender} = req.body;
    const admin = { ...req.body };
    const saveUser = await Users.findByIdAndUpdate(id, admin, { runValidators: true, new: true })
    req.flash('success', 'Successfully Updated Profile!')
    res.redirect(`/admin/admin.profile`);
});

router.get('/admin/admin.clients', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client'}).sort({_id: -1});;
    res.render('admin/clients', {admin, clients});
});

router.get('/admin/admin.clients/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const client = await Users.findById(req.params.id).populate('referrals');
    const clientWal = await Users.findById(req.params.id).populate('trades');
    const clientNotification = await Users.findById(req.params.id).populate({path: 'notifications', options: { sort: { 'notificationdate': -1 } } });
    const userTransact = await Users.findById(req.params.id).populate({path: 'transaction', options: { sort: { 'transactiondate': -1 } } });
    const userInvest = await Users.findById(req.params.id).populate('investment');
    const userWallets = await Users.findById(req.params.id).populate({path: 'trades'});
    const deposits = await Transaction.find({validateUser: client, transactionType: 'Deposit'}).sort({transactiondate: -1});
    const withdrawal = await Transaction.find({validateUser: client, transactionType: 'Withdraw'}).sort({transactiondate: -1});
    res.render('admin/clientinfo', {admin, client, userWallets, userTransact, clientNotification, userInvest, deposits, withdrawal, clientWal});
});

// router.put('/admin/admin.clients/:id/edit-wallet/:walletid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
//     const {id, walletid} = req.params;
//     const user = await Users.findById(id)
//     const {cryptoAddress} = req.body;

//     const update = { ...req.body };
//     const updateWallet = await Trades.findByIdAndUpdate(walletid, update, { runValidators: true, new: true })
//     const checkwal = await Walletaddresses.findOne({depositaddress: updateWallet.cryptoAddress});
//     if (checkwal === null) {
//         const updateCryptoWallet = await new Walletaddresses({depositmethodname: updateWallet.tradeCurrency, depositaddress: updateWallet.cryptoAddress});
//         await updateCryptoWallet.save();
//     }
//     req.flash('success', 'Wallet Address Updated.')
//     res.redirect(`/admin/admin.clients/${id}`)
// });

router.put('/admin/admin.topup/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    const {amount} = req.body;
    const intendedAmount = parseInt(amount)
    await user.updateOne({wallet: user.wallet + intendedAmount, tradebonus: user.tradebonus + intendedAmount}, { runValidators: true, new: true });
    req.flash('success', `$${intendedAmount.toLocaleString()} added to wallet`)
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.debit-wallet/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    const {amount} = req.body;
    const intendedAmount = parseInt(amount)
    await user.updateOne({wallet: user.wallet - intendedAmount}, { runValidators: true, new: true });
    req.flash('success', `$${intendedAmount.toLocaleString()} debited from wallet`)
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.trading-progress/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    const {percent} = req.body;
    const newPercent = parseInt(percent)
    await user.updateOne({tradeprogress: newPercent}, { runValidators: true, new: true });
    req.flash('success', `Trading progress updated`)
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.active-deposit/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id; 
    const {transactiondate, amount, transactionmethod} = req.body;
    const approvedamount = parseInt(amount);

    const client = await Users.findById(id);

    const deposit = new Transaction({transactionmethod, amount: approvedamount, transactiondate, transactionType: 'Deposit', paymentstatus: 'Completed', status: 'Successful', validateUser: client});
    client.transaction.push(deposit);
    await deposit.save();
    await client.save()
    await client.updateOne({wallet: client.wallet + approvedamount, totaldeposits: client.totaldeposits + approvedamount}, { runValidators: true, new: true });
   
    req.flash('success', 'Deposit Success!')
    res.redirect(`/admin/admin.clients/${id}`)
});

// router.post('/admin/admin.trade/:id/activate/:walletid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
//     const {id, walletid}  = req.params;

//     const now = new Date();
//     const priceUpdateTime = new Date(now.getTime() +  24 * 60 * 60 * 1000)

//     const user = await Users.findById(id);
//     const wallet = await Trades.findById(walletid);
//     const investedAmount = parseInt(wallet.currencyWallet)

//         await wallet.updateOne({status: "Active", currentinvestedamount: investedAmount, currencyWallet: 0 }, { runValidators: true, new: true });
//         const newWalletTransaction = new Tradetracker({amount: investedAmount, tradeCurrency: wallet.tradeCurrency, action: 'Trade', status: "Successful", validateTrade: wallet, tradeId: wallet.id});
//         await newWalletTransaction.save();
        
//         wallet.nextPriceUpdate = priceUpdateTime;
//         await wallet.save();
//         req.flash('success', `Your trade is now active!`)
//         res.redirect(`/admin/admin.clients/${id}`)
    
// });

router.put('/admin/admin.clients/:id/enable-withdrawal', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    await user.updateOne({allowWithdrawal: 'Yes'}, { runValidators: true, new: true });
    req.flash('success', 'Withdrawal Enabled.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/disable-withdrawal', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    await user.updateOne({allowWithdrawal: 'No'}, { runValidators: true, new: true });
    req.flash('success', 'Withdrawal Disabled.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/change-currency', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    const {basecurrency, basecurrencysymbol, country} = req.body;
    await user.updateOne({basecurrency, basecurrencysymbol, country}, { runValidators: true, new: true });
    req.flash('success', 'Currency Changed.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/enable-trade', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    await user.updateOne({allowTrade: 'Yes'}, { runValidators: true, new: true });
    req.flash('success', 'Trade Enabled.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/disable-trade', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    await user.updateOne({allowTrade: 'No'}, { runValidators: true, new: true });
    req.flash('success', 'Trade Disabled.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/update-limit', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    const {walletBalanceLimit} = req.body
    await user.updateOne({walletBalanceLimit: walletBalanceLimit}, { runValidators: true, new: true });
    req.flash('success', 'Done.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/suspend-acct', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    await user.updateOne({acctstatus: 'Suspended'}, { runValidators: true, new: true });
    req.flash('success', 'Account Suspended.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/account-type', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    const {accountType} = req.body;

    const update = { ...req.body };

    await user.updateOne(update, { runValidators: true, new: true });
    req.flash('success', 'Account Type Updated.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/activate-acct', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    await user.updateOne({acctstatus: 'Active'}, { runValidators: true, new: true });
    req.flash('success', 'Account Activated.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/verify-acct', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    await user.updateOne({verificationstatus: 'Verified', acctstatus: 'Active'}, { runValidators: true, new: true });
    req.flash('success', 'Account Verified.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.clients/:id/unverify-acct', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    await user.updateOne({verificationstatus: 'Not Verified', acctstatus: 'Not Active'}, { runValidators: true, new: true });
    req.flash('success', 'Account Unverified.')
    res.redirect(`/admin/admin.clients/${id}`)
});

router.put('/admin/admin.change-user-password/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id)
    const {currentpassword, password, confirmpassword} = req.body;

    const validPassword = await bcrypt.compare(currentpassword, user.password);
    if(validPassword) {
        if(password === confirmpassword) {
            const hashedpassword = await bcrypt.hash(password, 12);
            await user.updateOne({password: hashedpassword, confirmpassword: confirmpassword}, { runValidators: true, new: true })
            req.flash('success', 'Password Changed.')
            res.redirect(`/admin/admin.clients/${id}`) 
        } else {
            req.flash('error', 'Passwords do not match.')
            res.redirect(`/admin/admin.clients/${id}`)
        }
    } else {
        req.flash('error', 'Incorrect Password.')
        res.redirect(`/admin/admin.clients/${id}`)
    }
    
});

router.delete('/admin/admin.delete-user/:id', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const id = req.params.id;
    const user = await Users.findById(id);
    const {password} = req.body;

    const validPassword = await bcrypt.compare(password, user.password);
    if(validPassword) {
        await user.deleteOne();
        req.flash('success', 'User deleted!')
        res.redirect(`/admin/admin.clients`);
    } else {
        req.flash('error', 'Incorrect Password.')
        res.redirect(`/admin/admin.clients/${user.id}`)
    }
    // await Notification.findByIdAndDelete(nid);
});

router.post('/admin/admin.notifications/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id  = req.params.id;
    const client = await Users.findById(id);
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {title, message} = req.body;
    const notification = new Notification({title, message, notificationdate: dateTime, validateUser: client});
    client.notifications.push(notification);
    await notification.save();
    await client.save()
    req.flash('success', 'Notification Sent!')
    res.redirect(`/admin/admin.clients/${client.id}`);
});

router.delete('/admin/client/:id/notifications/:nid/delete', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const { id, nid } = req.params;
    const client = await Users.findById(id);
    await Notification.findByIdAndDelete(nid);
    req.flash('success', 'Successfully deleted notification!')
    res.redirect(`/admin/admin.clients/${client.id}`);
});

router.post('/admin/admin.clients/findUser', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const {findUser} = req.body
    const client = await Users.findOne({email: findUser});
    if (client) {
        res.redirect(`/admin/admin.clients/${client.id}`)
    } else {
        req.flash('error', 'No user with given email found!')
        res.redirect('/admin/admin.clients')
    }
});

router.get('/admin/admin.verificationrequests', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client' } && {verificationstatus: 'Pending'});
    res.render('admin/verificationrequest', {admin, clients});
});

router.put('/admin/admin.verificationrequests/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id; 
    const user = await Users.findByIdAndUpdate(id, {verificationstatus: 'Verified', acctstatus: 'Active'}, { runValidators: true, new: true });
    const subject = 'USER VERIFICATION';
    await acctVerifiedMail(user.email, subject, user.firstname);
    req.flash('success', 'Successfully Verified Client!')
    res.redirect('/admin/admin.verificationrequests')
});

router.get('/admin/admin.view-request/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const client = await Users.findById(req.params.id);
    res.render('admin/verificationview', {admin, client});
});

router.put('/admin/admin.verificationrequests/:id/decline', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id; 
    const user = await Users.findByIdAndUpdate(id, {verificationstatus: 'Not Verified'}, { runValidators: true, new: true });
    // const subject = 'USER VERIFICATION';
    // await acctVerifiedMail(user.email, subject, user.firstname);
    req.flash('success', 'Done!')
    res.redirect('/admin/admin.verificationrequests')
});

router.get('/admin/admin.deposit-req', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client' }).populate({path: 'transaction', options: { sort: { 'transactiondate': -1 } } });
    const deposits = await Transaction.find({status: 'Pending', transactionType: 'Deposit', paymentstatus: 'Completed'});
    const upgradefee = await Transaction.find({status: 'Pending', transactionType: 'Upgrade Fee', paymentstatus: 'Completed'});
    const signalfee = await Transaction.find({
        status: 'Pending',
        paymentstatus: 'Completed',
        $or: [
          { transactionType: 'Signal Fee' },
          { transactionType: 'Subscription Fee' }
        ]
      });
    res.render('admin/deposit', {admin, clients, deposits, upgradefee, signalfee});
});

router.get('/admin/admin.view-deposit/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    // const clients = await Users.find({role: 'client' }).populate({path: 'transaction', options: { sort: { 'transactiondate': -1 } } });
    const deposit = await Transaction.findById(req.params.id);
    const depositor = await Users.findById(deposit.validateUser);
    res.render('admin/depositview', {admin, deposit, depositor});
});

router.put('/admin/admin.deposit-req/:id/verify/:depositid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, depositid } = req.params; 
    const {depositedamount} = req.body;
    const approvedamount = parseInt(depositedamount);
    const deposit = await Transaction.findByIdAndUpdate(depositid, {status: 'Successful'}, { runValidators: true, new: true });
    const client = await Users.findById(id);
    const ref = await Users.findOne({username: client.referredby})
    await client.updateOne({wallet: client.wallet + approvedamount, totaldeposits: client.totaldeposits + approvedamount}, { runValidators: true, new: true });
    const subject = 'DEPOSIT';
    await depositMail(client.email, subject, client.firstname, approvedamount);
    req.flash('success', 'Successfully Verified Deposit!')
    res.redirect('/admin/admin.deposit-req')
});

router.put('/admin/admin.deposit-req/:id/decline/:depositid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, depositid } = req.params; 
    const client = await Users.findById(id);
    const deposit = await Transaction.findByIdAndUpdate(depositid, {status: 'Unsuccessful'}, { runValidators: true, new: true });
    const subject = 'DEPOSIT';
    await declinedepositMail(client.email, subject, client.firstname, deposit.amount);
    req.flash('success', 'Deposit Declined!')
    res.redirect('/admin/admin.deposit-req')
});

router.put('/admin/admin.cryptowalletdeposit-req/:id/verify/:depositid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, depositid } = req.params; 
    const deposit = await Transaction.findById(depositid);
    await deposit.updateOne({status: 'Successful'}, { runValidators: true, new: true });

    const wallet = await Trades.findById(deposit.cryptoWalletId);
    const walletTracker = await Tradetracker.findById(deposit.cryptoWalletTrackerId);

    await wallet.updateOne({currencyWallet: wallet.currencyWallet + deposit.amount}, { runValidators: true, new: true });
    await walletTracker.updateOne({status: 'Successful'}, { runValidators: true, new: true });
    
    req.flash('success', 'Successfully Verified Deposit!')
    res.redirect('/admin/admin.deposit-req')
});

router.put('/admin/admin.cryptowalletdeposit-req/:id/decline/:depositid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, depositid } = req.params; 
    const client = await Users.findById(id);
    const deposit = await Transaction.findByIdAndUpdate(depositid, {status: 'Unsuccessful'}, { runValidators: true, new: true });
    const subject = 'DEPOSIT';
    await declinedepositMail(client.email, subject, client.firstname, deposit.amount);
    req.flash('success', 'Deposit Declined!')
    res.redirect('/admin/admin.deposit-req')
});

router.put('/admin/upgrade-account/:id/verify/:depositid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, depositid } = req.params; 
    const deposit = await Transaction.findByIdAndUpdate(depositid, {status: 'Successful'}, { runValidators: true, new: true });
    const client = await Users.findByIdAndUpdate(id, {accountType: deposit.narration}, { runValidators: true, new: true });
    const subject = 'ACCOUNT UPGRADE';
    await acctUpgradeMail(client.email, subject, client.firstname, client.accountType);
    req.flash('success', 'Payment confirmed and account has been upgraded!')
    res.redirect('/admin/admin.deposit-req')
});

router.put('/admin/admin.signal/:id/verify/:depositid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, depositid } = req.params; 
    const deposit = await Transaction.findByIdAndUpdate(depositid, {status: 'Successful'}, { runValidators: true, new: true });
    const signal = await Plans.findOne({name: deposit.narration})
    const client = await Users.findByIdAndUpdate(id, {subscribedSignalId: signal.id}, { runValidators: true, new: true });
    
    const subject = 'SIGNAL SUBSCRIPTION';
    await signalMail(client.email, subject, client.firstname, signal.name);
    req.flash('success', 'Payment confirmed and subscription validated!')
    res.redirect('/admin/admin.deposit-req')
});

router.put('/admin/admin.subscription/:id/verify/:depositid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, depositid } = req.params; 
    const deposit = await Transaction.findByIdAndUpdate(depositid, {status: 'Successful'}, { runValidators: true, new: true });
    const subscription = await Plans.findOne({name: deposit.narration})
    const client = await Users.findByIdAndUpdate(id, {subscribedSubscriptionId: subscription.id}, { runValidators: true, new: true });
    
    // const subject = 'SIGNAL SUBSCRIPTION';
    // await signalMail(client.email, subject, client.firstname, signal.name);
    req.flash('success', 'Payment confirmed and subscription validated!')
    res.redirect('/admin/admin.deposit-req')
});

router.get('/admin/admin.depositmethods', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client' });
    const deposits = await Depositmethods.find({});
    res.render('admin/depositmethod', {admin, clients, deposits});
});

router.post('/admin/admin.depositmethods',isAdminLoggedIn, onlyAdmin, upload.array('depositqrcode'), async(req, res) => {
    const id  = req.user.id;
    const admin = await Users.findById(id);
    const depositmethod = new Depositmethods(req.body);
    depositmethod.depositqrcode = req.files.map(f => ({url: f.path, filename: f.filename}));
    await depositmethod.save()
    req.flash('success', 'Successfully added a deposit method.')
    res.redirect('/admin/admin.depositmethods');
});

// router.get('/admin/admin.depositmethods/:id/edit', isAdminLoggedIn, onlyAdmin, upload.array('depositqrcode'), async(req, res) => {
//     const id  = req.user.id;
//     const depositid = req.params.id;
//     const admin = await Users.findById(id);
//     const depositmethod = await Depositmethods.findById(depositid);
//     res.render('admin/editdepositmethod', {admin, depositmethod});
// });

router.put('/admin/admin.depositmethods/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const {depositmethodname, depositaddress} = req.body;
    const depositmethod = await Depositmethods.findByIdAndUpdate(id, {depositmethodname, depositaddress}, { runValidators: true, new: true });
    // depositmethod.depositqrcode = req.files.map(f => ({url: f.path, filename: f.filename}));
    await depositmethod.save()
    req.flash('success', 'Successfully updated deposit method.')
    res.redirect('/admin/admin.depositmethods')
});

router.delete('/admin/admin.depositmethods/:id', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const  id  = req.params.id;
    await Depositmethods.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted deposit method!')
    res.redirect('/admin/admin.depositmethods')
});


router.get('/admin/admin.deposit-history', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client' }).populate({path: 'transaction', options: { sort: { 'transactiondate': -1 } } });
    const deposits = await Transaction.find({transactionType: 'Deposit'});
    res.render('admin/deposithistory', {admin, clients, deposits});
});

router.get('/admin/admin.withdrawal-history', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client' }).populate({path: 'transaction', options: { sort: { 'transactiondate': -1 } } });
    const withdrawals = await Transaction.find({transactionType: 'Withdraw', paymentstatus: 'Completed'});
    res.render('admin/withdrawalhistory', {admin, clients, withdrawals});
});

router.get('/admin/admin.withdrawal-req', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client' }).populate({path: 'transaction', options: { sort: { 'transactiondate': -1 } } });
    const withdrawals = await Transaction.find({status: 'Pending', transactionType: 'Withdraw', paymentstatus: 'Completed'});
    res.render('admin/withdraw', {admin, clients, withdrawals});
});

router.put('/admin/admin.withdrawal-req/:id/edit/:withdrawalid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, withdrawalid } = req.params;    
    const withdrawal = await Transaction.findByIdAndUpdate(withdrawalid, {withdrawaddress: req.body.withdrawaddress}, { runValidators: true, new: true });
    req.flash('success', 'Successfully Changed Address!')
    res.redirect(`/admin/admin.view-withdrawal/${withdrawalid}`)
});

router.get('/admin/admin.view-withdrawal/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const withdrawal = await Transaction.findById(req.params.id);
    const client = await Users.findById(withdrawal.validateUser);
    res.render('admin/withdrawalview', {admin, withdrawal, client});
});

router.put('/admin/admin.withdrawal-req/:id/verify/:withdrawalid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, withdrawalid } = req.params;    
    const withdrawal = await Transaction.findByIdAndUpdate(withdrawalid, {status: 'Successful'}, { runValidators: true, new: true });
    const client = await Users.findById(id);
    if (client.wallet > 0) {
        await client.updateOne({wallet: client.wallet - withdrawal.amount, totalwithdrawals: client.totalwithdrawals + withdrawal.amount}, { runValidators: true, new: true });
    } else {
        req.flash('error', 'Insufficient Balance!')
        res.redirect('/admin/admin.withdrawal-req')
    }
    req.flash('success', 'Successfully Verified Withdrawal!')
    res.redirect('/admin/admin.withdrawal-req')
});

router.put('/admin/admin.withdrawal-req/:id/decline/:withdrawalid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, withdrawalid } = req.params;    
    const withdrawal = await Transaction.findByIdAndUpdate(withdrawalid, {status: 'Unsuccessful'}, { runValidators: true, new: true });
    req.flash('success', 'Withdrawal Disapproved!')
    res.redirect('/admin/admin.withdrawal-req')
});



//admin investment route

router.get('/admin/admin.opened-trades', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client' }).populate({path: 'investment', options: { sort: { 'startDate': -1 } } });
    const activeinvestments = await Investment.find({status: 'Active'}).sort({startDate: 1});
    const inactiveinvestments = await Investment.find({status: 'Completed'}).sort({startDate: -1});
    res.render('admin/investment', {admin, clients, activeinvestments, inactiveinvestments });
});

router.get('/admin/admin.closed-trades', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client' }).populate({path: 'investment', options: { sort: { 'startDate': -1 } } });
    const activeinvestments = await Investment.find({status: 'Active'}).sort({startDate: -1});
    const inactiveinvestments = await Investment.find({status: 'Completed'}).sort({startDate: -1});
    res.render('admin/closedtrades', {admin, clients, activeinvestments, inactiveinvestments });
});

router.get('/admin/admin.investment/:id/:investmentid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, investmentid } = req.params; 
    const admin = await Users.findById(req.user.id);
    const client = await Users.findById(id).populate('investment');
    const investment = await Investment.findById(investmentid);
    const tradeactivity  = await Tradetracker.find({
        $and: [
            {action: { $in: ["Trade Opened", "Trade Closed", "Profit", "Loss"]}},
            {investmentId: investment.id}
        ]}).sort({date: -1});
    // const totalincome = parseInt(investment.investedamount) + parseInt(investment.investmentprofit);   
    res.render('admin/investment-show', {admin, client, investment, tradeactivity});
});

router.put('/admin/admin.investment/:id/:investmentid/increase', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, investmentid } = req.params;   
    const {addprofits} = req.body;
    const client = await Users.findById(id).populate('investment');
    const investment = await Investment.findById(investmentid);
    const wallet = await Trades.findById(investment.validateTradeID);
    const profits = parseInt(addprofits)
    await investment.updateOne({investmentprofit: investment.investmentprofit + profits }, { runValidators: true, new: true });
    await wallet.updateOne({currentinvestmentprofit: wallet.currentinvestmentprofit + profits}, { runValidators: true, new: true });
    const newTradeTransaction = new Tradetracker({amount: profits, tradeCurrency: wallet.tradeCurrency, action: 'Profit', status: "Successful", validateTrade: wallet, tradeId: wallet.id, investmentId: investment.id});
    wallet.tradeTracker.push(newTradeTransaction);
    await newTradeTransaction.save();
    await wallet.save()
    req.flash('success', `Successfully added ${profits} USD.`)
    res.redirect(`/admin/admin.investment/${client.id}/${investment.id}`)
});

router.put('/admin/admin.investment/:id/:investmentid/deduct', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, investmentid } = req.params;   
    const {amount} = req.body;
    const client = await Users.findById(id).populate('investment');
    const investment = await Investment.findById(investmentid);
    const wallet = await Trades.findById(investment.validateTradeID);
    const removeamount = parseInt(amount)
    await investment.updateOne({investmentprofit: investment.investmentprofit - removeamount }, { runValidators: true, new: true });
    await wallet.updateOne({currentinvestmentprofit: wallet.currentinvestmentprofit - removeamount}, { runValidators: true, new: true });
    const newTradeTransaction = new Tradetracker({amount: removeamount, tradeCurrency: wallet.tradeCurrency, action: 'Loss', status: "Successful", validateTrade: wallet, tradeId: wallet.id, investmentId: investment.id});
    wallet.tradeTracker.push(newTradeTransaction);
    await newTradeTransaction.save();
    await wallet.save()
    req.flash('success', `Successfully deducted ${removeamount} USD.`)
    res.redirect(`/admin/admin.investment/${client.id}/${investment.id}`)
});

router.put('/admin/admin.investment/:id/:investmentid/endinvestment',  isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const { id, investmentid } = req.params;  
    const client = await Users.findById(id).populate('investment');
    const investment = await Investment.findById(investmentid);
    const wallet = await Trades.findById(investment.validateTradeID);
    // const totalprofit = parseInt(investment.investedamount) + parseInt(investment.investmentprofit);
    const totalprofit = parseInt(investment.investmentprofit);
    const amountinvested = parseInt(investment.investedamount);

    await client.updateOne({wallet: client.wallet + totalprofit + amountinvested, totalprofits: client.totalprofits + totalprofit}, { runValidators: true, new: true });
    await investment.updateOne({status: 'Completed'}, { runValidators: true, new: true });
    await wallet.updateOne({lastinvestedamount: wallet.currentinvestedamount, lastinvestmentprofit: wallet.currentinvestmentprofit, lastSessionID: wallet.currentSessionID, currentinvestedamount: 0, currentinvestmentprofit: 0, currentSessionID: '', status: 'Inactive'}, { runValidators: true, new: true });
    const newTradeTransaction = new Tradetracker({amount: totalprofit, tradeCurrency: wallet.tradeCurrency, action: 'Trade Closed', status: "Successful", validateTrade: wallet, tradeId: wallet.id, investmentId: investment.id});
    wallet.tradeTracker.push(newTradeTransaction);
    await newTradeTransaction.save();
    await wallet.save()
    
    // const subject = 'INVESTMENT COMPLETED';
    // await endInvestmentMail(client.email, subject, client.firstname, investment.packagetype, investment.investedamount, investment.investmentprofit);
    req.flash('success', `Successfully ended current investment.`)
    res.redirect(`/admin/admin.investment/${client.id}/${investment.id}`)
});


router.put('/admin/admin.investment/:id/:investmentid/increase-extra', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, investmentid } = req.params;   
    const {addprofits} = req.body;
    const client = await Users.findById(id).populate('investment');
    const investment = await Investment.findById(investmentid);
    const profits = parseInt(addprofits)
    await investment.updateOne({investmentprofit: investment.investmentprofit + profits }, { runValidators: true, new: true });
    if (investment.investmentType !== 'Staking' && investment.investmentType !== 'Real Estate')  {
        const newTradeTransaction = new Tradetracker({amount: profits, tradeCurrency: investment.tradedCurrency, action: 'Profit', status: "Successful", investmentId: investment.id});
        await newTradeTransaction.save();
    }
    req.flash('success', `Successfully added ${profits} USD.`)
    res.redirect(`/admin/admin.investment/${client.id}/${investment.id}`)
});

router.put('/admin/admin.investment/:id/:investmentid/deduct-extra', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, investmentid } = req.params;   
    const {amount} = req.body;
    const client = await Users.findById(id).populate('investment');
    const investment = await Investment.findById(investmentid);
    const removeamount = parseInt(amount)
    await investment.updateOne({investmentprofit: investment.investmentprofit - removeamount }, { runValidators: true, new: true });
    const newTradeTransaction = new Tradetracker({amount: removeamount, tradeCurrency: investment.tradedCurrency, action: 'Loss', status: "Successful", investmentId: investment.id});
    await newTradeTransaction.save();
    req.flash('success', `Successfully deducted ${removeamount} USD.`)
    res.redirect(`/admin/admin.investment/${client.id}/${investment.id}`)
});

router.put('/admin/admin.investment/:id/:investmentid/close',  isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const { id, investmentid } = req.params;  
    const client = await Users.findById(id).populate('investment');
    const investment = await Investment.findById(investmentid);
    // const totalprofit = parseInt(investment.investedamount) + parseInt(investment.investmentprofit);
    const totalprofit = parseInt(investment.investmentprofit);
    const amountinvested = parseInt(investment.investedamount);

    await client.updateOne({wallet: client.wallet + totalprofit + amountinvested, totalprofits: client.totalprofits + totalprofit}, { runValidators: true, new: true });
    await investment.updateOne({status: 'Completed'}, { runValidators: true, new: true });
    const subject = 'INVESTMENT COMPLETED';
    // await endInvestmentMail(client.email, subject, client.firstname, investment.packagetype, investment.investedamount, investment.investmentprofit);
    req.flash('success', `Successfully ended current investment.`)
    res.redirect(`/admin/admin.investment/${client.id}/${investment.id}`)
});




//ACCOUNT PLANS CONTROL
router.get('/admin/admin.upgrade-plans', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const plans = await Plans.find({planType: 'Account Upgrade'}).sort({duration: 1});
    res.render('admin/upgradeplans', {admin, plans});
});

router.post('/admin/admin.upgrade-plans',isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id  = req.user.id;
    const admin = await Users.findById(id);
    const {name, amount, description} = req.body;
    const plans = new Plans({planType: 'Account Upgrade', name, amount, description});
    await plans.save()
    req.flash('success', 'Successfully added a new account upgrade plan.')
    res.redirect('/admin/admin.upgrade-plans');
});

router.put('/admin/admin.upgrade-plans/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;    
    const plan = await Plans.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash('success', 'Successfully edited plan.')
    res.redirect('/admin/admin.upgrade-plans')
});

router.delete('/admin/admin.upgrade-plans/:id', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const  id  = req.params.id;
    await Plans.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted plan..')
    res.redirect('/admin/admin.upgrade-plans')
});


router.get('/admin/admin.signal-plans', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const plans = await Plans.find({planType: 'Signal'}).sort({duration: 1});
    res.render('admin/signalplan', {admin, plans});
});

router.post('/admin/admin.signal-plans',isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id  = req.user.id;
    const admin = await Users.findById(id);
    const {name, amount, description} = req.body;
    const plans = new Plans({planType: 'Signal', name, amount, description});
    await plans.save()
    req.flash('success', 'Successfully added a new signal plan.')
    res.redirect('/admin/admin.signal-plans');
});

router.put('/admin/admin.signal-plans/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;    
    const plan = await Plans.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash('success', 'Successfully edited plan.')
    res.redirect('/admin/admin.signal-plans')
});

router.delete('/admin/admin.signal-plans/:id', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const  id  = req.params.id;
    await Plans.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted plan..')
    res.redirect('/admin/admin.signal-plans')
});

router.get('/admin/admin.investment-plans', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const plans = await Plans.find({planType: 'Investment'}).sort({duration: 1});
    res.render('admin/investmentplan', {admin, plans});
});

router.post('/admin/admin.investment-plans',isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id  = req.user.id;
    const admin = await Users.findById(id);
    const {name, minamount, maxamount, duration, roi} = req.body;
    const plans = new Plans({planType: 'Investment', name, minamount, maxamount, duration, roi});
    await plans.save()
    req.flash('success', 'Successfully added a new investment plan.')
    res.redirect('/admin/admin.investment-plans');
});

// router.put('/admin/admin.investment-plans/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
//     const id = req.params.id;    
//     const {name, minamount, maxamount, duration, roi} = req.body;
//     const minimumamount = parseInt(minamount);
//     const maximumamount = parseInt(maxamount);
//     const plan = await Plans.findByIdAndUpdate(id, {name, minamount: minimumamount, maxamount: maximumamount, duration, roi}, { runValidators: true, new: true });
//     req.flash('success', 'Successfully edited plan.')
//     res.redirect('/admin/admin.investment-plans')
// });

router.put('/admin/admin.investment-plans/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;    
    const plan = await Plans.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash('success', 'Successfully edited plan.')
    res.redirect('/admin/admin.investment-plans')
});

router.delete('/admin/admin.investment-plans/:id', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const  id  = req.params.id;
    await Plans.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted plan..')
    res.redirect('/admin/admin.investment-plans')
});


// admin trade center routes

router.get('/admin/admin.user-assets/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const client = await Users.findById(req.params.id).populate({path: 'trades'});
    const activetrades = await Trades.find({status: 'Active', validateUser: client});
    const inactivetrades = await Trades.find({status: 'Inactive', validateUser: client});
    res.render('admin/userassets', {admin, client, activetrades, inactivetrades });
});

// router.get('/admin/admin.trade-center', isAdminLoggedIn, onlyAdmin, async(req, res) => {
//     const admin = await Users.findById(req.user.id);
//     const clients = await Users.find({role: 'client' }).populate({path: 'trades'});
//     const activetrades = await Trades.find({status: 'Active'});
//     const inactivetrades = await Trades.find({status: 'Inactive'});
//     res.render('admin/trades', {admin, clients, activetrades, inactivetrades });
// });

// router.get('/admin/admin.trade/:id/:tradeId', isAdminLoggedIn, onlyAdmin, async(req, res) => {
//     const { id, tradeId } = req.params; 
//     const admin = await Users.findById(req.user.id);
//     const client = await Users.findById(id).populate('trades');
//     const trade = await Trades.findById(tradeId);
//     const totalincome = parseInt(trade.currentinvestedamount) + parseInt(trade.currentinvestmentprofit);   
//     res.render('admin/trade-show', {admin, client, trade, totalincome});
// });


router.put('/admin/admin.trade/:id/:walletid', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const { id, walletid } = req.params;   
    const {addprofits} = req.body;
    const client = await Users.findById(id).populate('trades');
    const wallet = await Trades.findById(walletid);
    const investment = await Investment.findById(wallet.currentSessionID);
    const profits = parseInt(addprofits)
    await wallet.updateOne({currentinvestmentprofit: wallet.currentinvestmentprofit + profits}, { runValidators: true, new: true });
    await investment.updateOne({investmentprofit: investment.investmentprofit + profits }, { runValidators: true, new: true });
    const newTradeTransaction = new Tradetracker({amount: profits, tradeCurrency: wallet.tradeCurrency, action: 'Profit', status: "Successful", validateTrade: wallet, tradeId: wallet.id});
    wallet.tradeTracker.push(newTradeTransaction);
    await newTradeTransaction.save();
    await wallet.save()

    req.flash('success', `Successfully added ${profits} USD to this wallet.`)
    res.redirect(`/admin/admin.user-assets/${client.id}`)
});

router.put('/admin/admin.trade/:id/:investmentid/endtrade',  isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const { id, investmentid } = req.params;  
    const client = await Users.findById(id).populate('trades');
    const trade = await Trades.findById(investmentid);
    const investedamountupdate = parseInt(trade.currentinvestedamount);
    const investmentprofitupdate = parseInt(trade.currentinvestmentprofit);
    const totalprofit = investedamountupdate + investmentprofitupdate;

    // await client.updateOne({wallet: client.wallet + totalprofit, totalprofits: client.totalprofits + totalprofit}, { runValidators: true, new: true });
    await trade.updateOne({currencyWallet:  trade.currencyWallet + totalprofit, status: 'Inactive', lastinvestedamount: investedamountupdate, lastinvestmentprofit: investmentprofitupdate, currentinvestedamount: 0, currentinvestmentprofit: 0}, { runValidators: true, new: true });
    const newTradeTransaction = new Tradetracker({amount: investmentprofitupdate, tradeCurrency: trade.tradeCurrency, action: 'Trade', status: "Successful", validateTrade: trade, tradeId: trade.id});
    trade.tradeTracker.push(newTradeTransaction);
    await newTradeTransaction.save();
    await trade.save()
    const subject = 'TRADING CYCLE COMPLETED';
    await endInvestmentMail(client.email, subject, client.firstname, trade.tradeCurrency, investedamountupdate, investmentprofitupdate);
    req.flash('success', `Successfully ended current investment.`)
    res.redirect(`/admin/admin.user-assets/${client.id}`)
});




router.get('/admin/admin.referral-dashboard', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id);
    const managers = await Managers.find().populate('referrals');
    const clients = await Users.find({role: 'client' }).populate('referrals');
    
    res.render('admin/affiliate', {admin, managers, clients});
});

router.post('/admin/add-manager', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    function generateRandomCode() {
        const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let code = '';

        for (let i = 0; i < 7; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters.charAt(randomIndex);
        }

        return code;
    }
    const randomCode = generateRandomCode();

    const {fullname, email, phonenumber} = req.body;
    const newmanager = new Managers({fullname, email, phonenumber, accesscode: randomCode});
    await newmanager.save();
    req.flash('success', 'Manager Added!')
    res.redirect(`/admin/admin.referral-dashboard`);
});

router.get('/admin/admin.experts', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id);
    const experttraders = await Managers.find().populate('subscribers');
    const clients = await Users.find({role: 'client' }).populate('referrals');
    
    res.render('admin/experttraders', {admin, experttraders, clients});
});

router.post('/admin/admin.experts', isAdminLoggedIn, onlyAdmin, upload.array('passport'), async(req, res) => {
    const {fullname, email, winrate, wins, profitshare, losses, numberofsubscribers, passport} = req.body;
    const newexperttrader = new Managers({fullname, email, winrate, wins, numberofsubscribers, profitshare, losses, passport});
    newexperttrader.passport =  req.files.map(f => ({url: f.path, filename: f.filename}))
    await newexperttrader.save();
    req.flash('success', 'New Trader Added!')
    res.redirect(`/admin/admin.experts`);
});

router.put('/admin/admin.experts/:id/edit', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const {fullname, email, numberofsubscribers, wins, winrate, losses} = req.body;
    const updateTrader = { ...req.body };
    const trader = await Managers.findByIdAndUpdate(id, updateTrader, { runValidators: true, new: true })
    req.flash('success', 'Successfully Updated Trader.')
    res.redirect(`/admin/admin.experts`);
});

router.delete('/admin/admin.experts/:id/delete', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const  id  = req.params.id;
    await Managers.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted trader profile.')
    res.redirect('/admin/admin.experts')
});


router.get('/admin/admin.reviews', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id);
    const reviews = await Reviews.find();
    
    res.render('admin/reviews', {admin, reviews});
});

router.post('/admin/admin.review', isAdminLoggedIn, onlyAdmin, upload.array('passport'), async(req, res) => {
    const {fullname, review, title, passport} = req.body;
    const newreview = new Reviews({fullname, review, passport});
    newreview.passport =  req.files.map(f => ({url: f.path, filename: f.filename}))
    await newreview.save();
    req.flash('success', 'New Review Added!')
    res.redirect(`/admin/admin.reviews`);
});

router.put('/admin/admin.reviews/:id/edit', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    const {fullname, review, title} = req.body;
    const updateReview = { ...req.body };
    const reviews = await Reviews.findByIdAndUpdate(id, updateReview, { runValidators: true, new: true })
    req.flash('success', 'Successfully Updated Review.')
    res.redirect(`/admin/admin.reviews`);
});

router.delete('/admin/admin.reviews/:id/delete', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const  id  = req.params.id;
    await Reviews.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted reviews.')
    res.redirect('/admin/admin.reviews')
});


router.get('/admin/admin.wallets', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id);
    const clients = await Users.find({role: 'client' }).populate('wallets');
    const wallets = await Token.find();
    const access = await Access.find();
    res.render('admin/wallets', {admin, clients, wallets, access});
});


router.get('/admin/admin.news', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const admin = await Users.findById(id);
    const allnews = await Post.find({}).sort({date: -1});
    res.render('admin/post', {admin, allnews});
});

router.get('/admin/admin.post-news', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const news = await Post.find({});
    res.render('admin/newpost', {admin, news});
});


router.post('/admin/admin.post-news', upload.array('postpictures'), async (req, res) => {
    // const date = new Date();
    const { date, title, description, postpictures } = req.body;
    const post = new Post({date, title, description});
    post.postpictures =  req.files.map(f => ({url: f.path, filename: f.filename}))
    await post.save();
    req.flash('success', 'News posted!')
    res.redirect('/admin/admin.news');
})

router.get('/admin/admin.view-news/:id', isAdminLoggedIn, onlyAdmin, async (req, res) => {
    try {
        const admin = await Users.findById(req.user.id);
        const news = await Post.findById(req.params.id);

        res.render('admin/viewnews', { admin, news});
    } catch (error) {
       req.flash('error', 'Unable to open selected news!')
        res.redirect('/admin/admin.news');
    }
});

router.delete('/admin/admin.news/:id/delete',  isAdminLoggedIn, onlyAdmin, async (req, res) => {
    const  id  = req.params.id;
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted news.')
    res.redirect('/admin/admin.news')
});

// router.post('/admin/admin.reviews', isAdminLoggedIn, onlyAdmin, async(req, res) => {
//     const admin = await Users.findById(req.user.id);
//     const today = new Date();
//     const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//     const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
//     const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
//     const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
//     const dateTime = date+' '+time+ ' ' + ampm;
//     const {username, comment} = req.body;
//     const review = new Reviews({username, comment, reviewdate: dateTime, status: 'Verified'});
//     await review.save();
//     req.flash('success', 'Review Submitted')
//     res.redirect(`/admin/admin.reviews/`);
// });

// router.delete('/admin/admin.reviews/:id',  isAdminLoggedIn, onlyAdmin, async (req, res) => {
//     const  id  = req.params.id;
//     await Reviews.findByIdAndDelete(id);
//     req.flash('success', 'Successfully deleted review.')
//     res.redirect('/admin/admin.reviews')
// });

// router.post('/admin/admin.email', async(req, res) => {
//     const { recipientEmail, mailSubject, mailBody } = req.body;
//     var transporter = nodemailer.createTransport({
//         host: process.env.HOST,
//         service: process.env.SERVICE,
//         port: 587,
//         secure: true,
//         auth: {
//             user: process.env.USER,
//             pass: process.env.PASS,
//         },
//     });
    
//     ejs.renderFile("views/admin/mailview.ejs", {mail: mailBody, subject: mailSubject},function (err, data) {
//     if (err) {
//         console.log(err);
//     } else {
//         var mainOptions = {
//             from: process.env.CUSTOMMAIL,
//             to: recipientEmail,
//             subject: mailSubject,
//             html: data
//         };
//         console.log("html data ======================>", mainOptions.html);
//         transporter.sendMail(mainOptions, function (err, info) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log('Message sent: ' + info.response);
//             }
//         });
//     }
//     });
//     req.flash('success', 'Successfully Sent Mail!');
//     res.redirect(`/admin/admin.dashboard`);
// });

//end email//


// delete multiple users


router.get('/admin/admin.deleteusers', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const admin = await Users.findById(req.user.id);
    const clients = await Users.find({role: 'client'}).sort({firstname: 1});;
    res.render('admin/deleteusers', {admin, clients});
});

const { ObjectId } = require('mongodb');  // Ensure ObjectId is properly imported
router.post('/admin/admin.deleteusers', async (req, res) => {
    const admin = await Users.findById(req.user.id);
    let selectedUsers = req.body.selectedUsers;  // Change 'const' to 'let' here

    try {
        if (!Array.isArray(selectedUsers)) {
            selectedUsers = [selectedUsers]; // Ensure selectedUsers is always an array
        }

        if (selectedUsers.length > 0) {
            // Filter out invalid ObjectIds before attempting deletion
            const userIdsToDelete = selectedUsers
                .filter(id => ObjectId.isValid(id)) // Only include valid ObjectId strings
                .map(id => new ObjectId(id));

            if (userIdsToDelete.length > 0) {
                // Log the userIdsToDelete to debug
                console.log('Attempting to delete users with IDs:', userIdsToDelete);

                // Delete selected users from MongoDB
                const result = await Users.deleteMany({ _id: { $in: userIdsToDelete } });

                if (result.deletedCount > 0) {
                    req.flash('success', 'Users deleted!');
                    return res.redirect('/admin/admin.deleteusers'); // Redirect to user list page after deletion
                } else {
                    req.flash('error', 'No users were deleted. Please check the selected users.');
                    return res.redirect('/admin/admin.deleteusers');
                }
            } else {
                req.flash('error', 'No valid user IDs selected!');
                return res.redirect('/admin/admin.deleteusers'); // Handle invalid IDs
            }
        } else {
            req.flash('error', 'No users selected!');
            return res.redirect('/admin/admin.deleteusers'); // Handle case when no users are selected
        }
    } catch (error) {
        console.error('Error details:', error);  // Log the full error object
        req.flash('error', 'An error occurred while deleting users!');
        return res.redirect('/admin/admin.deleteusers');
    }
});





router.get('/admin.logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            // Handle the error if needed
            return next(err);
        }
        res.redirect('/secureadmin.login');
    });
});



module.exports = router;