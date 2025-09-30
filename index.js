if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const webpages = require('./routes/webpages');
const user = require('./routes/user');
const admin = require('./routes/admin');
const paymentRoute = require('./routes/payment');
const walletconnect = require('./routes/walletconnect');
const coinRoutes = require("./routes/coinroutes");
const passwordReset = require("./routes/passwordReset");
const tradeCenterRoute = require("./routes/tradecenter");
const Users = require('./models/users');
const Investment = require('./models/investment');
const Post = require('./models/post');
const Depositmethods = require('./models/depositmethod');
const Plans = require('./models/plans');
const Trades = require('./models/trade');
const Tradetracker = require('./models/tradetracker');
const Managers = require('./models/manager');
const Referral = require('./models/referral');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
// const dbUrl = 'mongodb://localhost:27017/thenetfi';

const dbUrl = 'mongodb+srv://admin:Fa0rV83d5HG8WNsd@cluster0.3xzsq.mongodb.net/thenetfi?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const cron = require('node-cron');
const moment = require('moment-timezone');
require('moment-timezone/data/packed/latest.json');
const axios = require('axios');
const Reviews = require('./models/reviews');




// mongodb database setup starts
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true})

const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => {
        console.log("Database connected")
    })

// mongodb database setup ends

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'));
app.use(methodOverride('_method'));


app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


const secret = process.env.SECRET ||  'thisshouldbeabettersecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24  * 60 * 60
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

// passport configuration start
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    // console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.websiteName = 'CryptRangers'
    res.locals.websiteLink = 'cryptrangers.tk'
    res.locals.websiteSupportMail = 'support@cryptrangers.tk';
    res.locals.websiteInfotMail = 'info@cryptrangers.tk';
    next();
})

app.use(passport.initialize());
app.use(passport.session());

// passport.use(new LocalStrategy(Users.authenticate()));
// passport.serializeUser(Users.serializeUser());
// passport.deserializeUser(Users.deserializeUser());

passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      Users.findOne({ email: email }).then(user => {
        if (!user) {
          return done(null, false, {
            message: "Invalid login email/ password."
          });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: "Invalid login password."
            });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
      Users.findById(id, function(err, user) {
      done(null, user);
    });
  });


  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
  
      const activeInvestmentsToUpdate = await Investment.find({status: 'Active'});
      const activeTrades = await Trades.find({ status: 'Active' });
  
      for (const investment of activeInvestmentsToUpdate) {
        
        if (investment.nextPriceUpdate <= now) {

            const percent = (parseInt(investment.investedamount) * parseInt(investment.roi)) / 100;
            // const randomNumber = Math.floor(Math.random() * (80 - 40) + 40);
            const randomNumber = Math.floor(Math.random() * (10 - 2));
            const totalProfit = percent + randomNumber;
            
            investment.investmentprofit += totalProfit;
      
            // Calculate the next price update time
            const priceUpdateTime = new Date(now.getTime() + 60 * 60 * 1000)
            investment.nextPriceUpdate = priceUpdateTime;
            await investment.save();
      
            console.log('investment profit updated:', investment);
            
          }
      }

      for (const trade of activeTrades) {
        
        if (trade.nextPriceUpdate <= now) {

            const percent = (parseInt(trade.currentinvestedamount) * parseInt(trade.dailyroi)) / 100;
            const randomNumber = Math.floor(Math.random() * (40 - 20) + 20);
            const totalProfit = percent + randomNumber;
            
            trade.currentinvestmentprofit += totalProfit;
            trade.currencyWallet += totalProfit;

            const newTradeTransaction = new Tradetracker({amount: totalProfit, tradeCurrency: trade.tradeCurrency, action: 'Profit', status: "Successful", validateTrade: trade, tradeId: trade.id});
            trade.tradeTracker.push(newTradeTransaction);
            await newTradeTransaction.save();
      
            // Calculate the next price update time
            const priceUpdateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            
            trade.nextPriceUpdate = priceUpdateTime;
            await trade.save();
      
            console.log('trade profit updated:', trade);
            
          }
      }
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  });
  






// Rest of your Express server setup and routes



   

// passport configuration ends

app.get('/', async(req, res) => {
  const reviews = await Reviews.find({planType: 'Investment'});
    res.render("home", {reviews})
})

// app.get('/home', async(req, res) => {
//     const investmentplans = await InvestmentPlans.find({});
//     const reviews = await Reviews.find({status: 'Verified'});
//     res.render("home", {investmentplans, reviews})
// })

app.use('/', webpages)
app.use('/', user)
app.use('/', admin)
app.use('/', passwordReset)
app.use('/', paymentRoute)
app.use('/', walletconnect)
app.use('/', coinRoutes)
app.use('/', tradeCenterRoute)

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});