const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
// const fetch = require("node-fetch");
const axios = require("axios");
const Users = require('../models/users');
const Notification = require('../models/notification');

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
    } else if (user.acctstatus === 'Suspended') {
        req.logout();
        req.flash("error", "Your account was suspended! Please contact your account's manager.")
        return res.redirect('/login')
    } 
    next();
}



router.get('/currency/bitcoin', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/bitcoin', {user, unreadmsg});
});

router.get('/currency/ethereum', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/ethereum', {user, unreadmsg});
});

router.get('/currency/tether', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/tether', {user, unreadmsg});
});

router.get('/currency/binancecoin', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/binancecoin', {user, unreadmsg});
});

router.get('/currency/usd-coin', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/usd-coin', {user, unreadmsg});
});

router.get('/currency/ripple', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/ripple', {user, unreadmsg});
});

router.get('/currency/cardano', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/cardano', {user, unreadmsg});
});

router.get('/currency/dogecoin', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/dogecoin', {user, unreadmsg});
});

router.get('/currency/solana', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/solana', {user, unreadmsg});
});

router.get('/currency/litecoin', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/litecoin', {user, unreadmsg});
});

router.get('/currency/tron', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/tron', {user, unreadmsg});
});

router.get('/currency/polkadot', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/polkadot', {user, unreadmsg});
});

router.get('/currency/matic-network', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/matic-network', {user, unreadmsg});
});

router.get('/currency/wrapped-bitcoin', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/wrapped-bitcoin', {user, unreadmsg});
});

router.get('/currency/shiba-inu', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/shiba-inu', {user, unreadmsg});
});

router.get('/currency/dai', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/dai', {user, unreadmsg});
});

router.get('/currency/binance-usd', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/binance-usd', {user, unreadmsg});
});

router.get('/currency/bitcoin-cash', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/bitcoin-cash', {user, unreadmsg});
});

router.get('/currency/osmosis', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    const unreadmsg = await await Notification.find({validateUser: user, status: 'Unread'})
    res.render('currency/osmosis', {user, unreadmsg});
});




module.exports = router;