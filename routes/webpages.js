const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
// const fetch = require("node-fetch");
const axios = require("axios");
const InvestmentPlans = require('../models/plans');




// router.get('/sign_up/:id', (req, res) => {
//     const mail = req.params.id
//     res.render('signup2', {mail});
// });

// router.post('/redirect_to_signup', async(req,res) => {
//     const {email} = req.body
//     res.redirect(`/sign_up/${email}`)
// })

router.get('/about', (req, res) => {
    res.render('about');
});

router.get('/faqs', (req, res) => {
    res.render('faq');
});


router.get('/contact', (req, res) => {
    res.render('contactus');
});

router.get('/trading', (req, res) => {
    res.render('plan');
});

router.get('/platforms', (req, res) => {
    res.render('platforms');
});

router.get('/quick-start', (req, res) => {
    res.render('quick-start');
});

router.get('/legals/terms', (req, res) => {
    res.render('t&c');
});

router.get('/legals/privacy', (req, res) => {
    res.render('privacy');
});

router.get('/funding', (req, res) => {
    res.render('funding');
});

// router.get('/services', async (req, res) => {
//     const investmentplans = await InvestmentPlans.find({planType: 'Investment'});
//     console.log(investmentplans)
//     res.render('services', {investmentplans});
// });

router.get('/news', (req, res) => {
    // const key = "8967d6df52ca4d4ea96078b35bf4dbae"
    // const newsurl = `https://newsapi.org/v2/everything?q=crypto&language=en&sortBy=publishedAt&pageSize=40&apiKey=${key}`
    // const fetchednews = fetch(newsurl)
    // console.log(fetchednews)
    // const fetchednews = 'https://api.newscatcherapi.com/v2/search?q=Tesla' -H 'oM_vJRkbk5vvd6-LB2Fx5n70ugXx6L8AnouOP8bko7E'
    

        const options = {
        method: 'GET',
        url: 'https://crypto-news16.p.rapidapi.com/news/top/40',
        headers: {
            'X-RapidAPI-Key': 'faa3a80a7amsh3fd97e3ceebb673p181cb8jsn37b22cadb0cc',
            'X-RapidAPI-Host': 'crypto-news16.p.rapidapi.com'
        }
        };

        const getnews = axios.request(options)

        axios.request(options).then(function (response) {
            // console.log(response);
            res.render('news', {newsdata: response.data});
        }).catch(function (error) {
            // console.error(error);
            res.render('news');
        });

    // res.render('news', {newsdata: response.data});
});

// router.get('/plans', async(req, res) => {
//     const plans = await InvestmentPlans.find({}).sort({duration: 1});
//     res.render('plan', {plans});
// });

// router.get('/api/plans/:planId', async (req, res) => {
//     try {
//       const planId = req.params.planId;
//       const plan = await InvestmentPlans.findById(planId);
  
//       if (!plan) {
//         return res.status(404).json({ message: 'Plan not found' });
//       }
  
//       res.json(plan);
//     } catch (error) {
//       console.error("Error fetching plan details:", error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

// router.get('/privacypolicy', (req, res) => {
//     res.render('policy');
// });


module.exports = router;