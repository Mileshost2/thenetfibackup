//NPM Dependencies//
const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const Transaction = require('../models/transaction');
const Investment = require('../models/investment');
const Depositmethods = require('../models/depositmethod');
const passport = require('passport');
const {sendEmail, welcomeMail, emailActMail, passwordResetMail, verifyMail, acctVerifiedMail, depositMail, openInvestmentMail, endInvestmentMail} = require("../utils/sendEmail");
const multer  = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });
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
    const { username, password } = req.body;
    const user = await Users.findOne({username});
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

const paidAcctCharges = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    if (user.accountchargesStatus === 'Unpaid') {
        req.flash('error', 'You are yet to pay the service charge!')
        return res.redirect('/user/service-charge-payment')
    } 
    next();
}
//End of Middlewares//



router.get('/user/service-charge-payment', isLoggedIn,  onlyClient, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposits = await Transaction.find({validateUser: user, transactionType: 'Payment'});
    const depositmethods  = await Depositmethods.find({});
    const accountbalance = parseInt(user.wallet);
    const charges = (accountbalance / 100) * 20;
    res.render('user/servicechargepayment', {user, depositmethods, deposits, charges });
});

router.post('/user/service-charge-payment', isLoggedIn, onlyClient, async(req, res) => {
    const id  = req.user.id;
    const user = await Users.findById(id);
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {transactionmethod, narration, amount} = req.body;
    const accountbalance = parseInt(user.wallet);
    const charges = (accountbalance / 100) * 20;
    const deposit = new Transaction({transactionmethod, narration, amount: charges, transactiondate: dateTime, transactionType: 'Payment', validateUser: user});
    user.transaction.push(deposit);
    await deposit.save();
    await user.save()
    res.redirect(`/user/payment/${deposit.id}`);
});

router.get('/user/payment/:id', isLoggedIn,  onlyClient, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposit = await Transaction.findById(req.params.id);
    const depositmethod  = await Depositmethods.findOne({depositmethodname: `${deposit.transactionmethod}`});
    res.render('user/payment2', {user, deposit, depositmethod});
});

router.put('/user/payment/:id', isLoggedIn, onlyClient,  upload.array('depositproof'), async (req, res) => {
    const id = req.params.id; 
    const {transactionproof, address} = req.body;
    const deposit = await Transaction.findByIdAndUpdate(id, {transactionproof, companywallet: address}, { runValidators: true, new: true })
    deposit.transactionproof =  req.files.map(f => ({url: f.path, filename: f.filename}))
    await deposit.save();
    
    req.flash('success', 'Please hold on while we verify your payment, an email will be sent to you shortly!!')
    res.redirect('/user/service-charge-payment')
});



router.get('/user/account-upgrade', isLoggedIn,  onlyClient, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposits = await Transaction.find({validateUser: user, transactionType: 'Payment'});
    const depositmethods  = await Depositmethods.find({});
    res.render('user/acctupgrade2', {user, depositmethods, deposits });
});

router.get('/user/upgrade-account', isLoggedIn,  onlyClient, async(req, res) => {
    const user = await Users.findById(req.user.id);
    const deposits = await Transaction.find({validateUser: user, transactionType: 'Payment'});
    const depositmethods  = await Depositmethods.find({});
    res.render('user/acctupgrade', {user, depositmethods, deposits });
});

router.post('/user/account-upgrade', isLoggedIn, onlyClient, async(req, res) => {
    const id  = req.user.id;
    const user = await Users.findById(id);
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {transactionmethod, narration, amount} = req.body;
    const deposit = new Transaction({transactionmethod, narration, amount: 200, transactiondate: dateTime, transactionType: 'Payment', validateUser: user});
    user.transaction.push(deposit);
    await deposit.save();
    await user.save()
    
    res.redirect(`/user/payment/${deposit.id}`);
});



// Handle payment creation request

router.post('/coinbase-payments/:id', isLoggedIn,  onlyClient, async (req, res) => {
   
    const transaction = await Transaction.findById(req.params.id);
    const chargedAmount = transaction.amount;
        try {
        //   const { chargedAmount } = req.body;

      
          // Create a charge using Coinbase Commerce API
          const chargeResponse = await axios.post(
            'https://api.commerce.coinbase.com/charges',
            {
              name: 'Sample Charge',
              description: 'Charge for a product or service',
              pricing_type: 'fixed_price',
              local_price: {
                amount: chargedAmount.toString(),
                currency: 'USD',
              },
              redirect_url: `http://localhost:8080/dashboard/deposits/payment/${transaction.id}`, // Replace with your redirect URL
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-CC-Api-Key': 'e0923f0f-60e3-425f-82db-4f1d507df6a8',
              },
            }
          );

          
      
          const chargeCode = chargeResponse.data.data.code;
          // console.log(chargeCode);
          const hosted_url = chargeResponse.data.data.hosted_url;
      
          // Store payment details in your MongoDB database
          await transaction.updateOne({chargeCode: chargeCode, onlinePaymentStatus: 'pending'}, { runValidators: true, new: true });

        //   const payment = new Payment({
        //     chargeCode,
        //     onlinePaymentStatus: 'pending', 
        //     Set an initial status for the payment
        //     ... additional payment details to store
        //   });
      
        //   await payment.save();
            // console.log(transaction);
        //   res.json({ success: true });
        res.redirect(hosted_url);
        } catch (error) {
          console.error(error);
        //   console.log('check' + hosted_url);
        //   res.json({ success: false });
        res.redirect(`/dashboard/deposits/payment/${transaction.id}`)
        }
      });
      
      // Handle Coinbase Commerce webhook notifications
router.post('/webhook', async (req, res) => {
        try {
          const { chargeCode, event } = req.body;
      
          // Update the payment status in your MongoDB database
          const transaction = await Transaction.findOneAndUpdate({ chargeCode }, { onlinePaymentStatus: event }, { new: true });
      
          // console.log(transaction);
          res.json({ success: true });
        } catch (error) {
          console.error(error);
          res.json({ success: false });
        }
      });



module.exports = router;