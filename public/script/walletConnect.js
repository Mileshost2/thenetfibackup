// const WalletConnect = require('walletconnect').default;

// Initialize WalletConnect
const walletConnect = new WalletConnect({
  bridge: 'https://bridge.walletconnect.org', // or your preferred bridge URL
  qrcodeModal: QRCodeModal // optional: use a custom QR code modal
});


async function connectWallet() {
    // Check if WalletConnect is already connected
    if (!walletConnect.connected) {
      // Create a new session
      await walletConnect.createSession();
  
      // Get the connect URI to display as a QR code or deeplink
      const uri = walletConnect.uri;
      // Display the URI to the user to scan or click
  
      // Wait for the user to scan the QR code or click the deeplink
      walletConnect.on('connect', (error, payload) => {
        if (error) {
          throw error;
        }
  
        // Handle the connection event
        handleWalletConnect(payload.params[0]);
      });
    }
  }


  async function handleWalletConnect(uri) {
    // Connect to the wallet using the URI
    await walletConnect.connect({ uri });
  
    // Get the accounts from the connected wallet
    const accounts = await web3.eth.getAccounts();
  
    // Get the balance of the first account
    const balance = await web3.eth.getBalance(accounts[0]);
  
    // Use the balance as needed in your application
    console.log('Wallet Balance:', balance);
  }
  