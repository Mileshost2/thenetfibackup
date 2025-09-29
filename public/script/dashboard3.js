//validates takeprofit and stoploss
document.getElementById('investedamount2').addEventListener('input', validateInputs2);
document.getElementById('takeprofit2').addEventListener('input', validateInputs2);
document.getElementById('stoploss2').addEventListener('input', validateInputs2);

function validateInputs2() {
    const investedAmount2 = parseFloat(document.getElementById('investedamount2').value);
    const takeProfit2 = parseFloat(document.getElementById('takeprofit2').value);
    const stopLoss2 = parseFloat(document.getElementById('stoploss2').value);

    const margin2 = investedAmount2 * 0.05;
    
    // Reset border colors
    document.getElementById('stoploss2').style.borderColor = '';
    document.getElementById('stoploss2').style.boxShadow = '';
    document.getElementById('takeprofit2').style.borderColor = '';
    document.getElementById('takeprofit2').style.boxShadow = '';
    
    // Validate Stop Loss
    if (!isNaN(stopLoss2) && stopLoss2 > investedAmount2 - margin2) {
        document.getElementById('stoploss2').style.borderColor = 'red';
        document.getElementById('stoploss2').style.boxShadow = '0 0 5px 5px rgba(255, 0, 0, 0.759)';
    }
    
    // Validate Take Profit
    if (!isNaN(takeProfit2) && takeProfit2 <= investedAmount2 + margin2) {
        document.getElementById('takeprofit2').style.borderColor = 'red';
        document.getElementById('takeprofit2').style.boxShadow = '0 0 5px 5px rgba(255, 0, 0, 0.759)';
    }
}

//finds tradetype and display assets in select
$('#tradetype2').on('change', function() {
    const tradeType2 = $(this).val();

    fetch(`/get-currencies/${tradeType2}`)
        .then(response => response.json())
        .then(data => {
            const currencySelect2 = $('#currency2');
            currencySelect2.empty(); // Clear existing options

            // Add the default "Select Asset" option
            const defaultOption2 = new Option('Select Asset', '', true, false);
            currencySelect2.append(defaultOption2);

            data.forEach(trade2 => {
                // Check if tradeType is 'Stocks'
                let optionValue2;
                if (tradeType2 === 'Stocks') {
                    optionValue2 = trade2.tradeSymbol; // Set value to tradeSymbol
                } else {
                    optionValue2 = trade2.tradeCurrency; // Set value to tradeCurrency
                }

                // Create option with tradeCurrency as the value
                const option2 = new Option(trade2.tradeCurrency, optionValue2, false, false);

                // Set a custom data attribute for tradeSymbol
                $(option2).data('tradeSymbol', trade2.tradeSymbol);

                currencySelect2.append(option2);
            });

            // Update the Select2 dropdown with custom formatting
            currencySelect2.select2({
                templateResult: formatState2,
                templateSelection: formatState2
            });
        })
        .catch(error2 => {
            console.error('Error fetching currencies:', error2);
            alert('Failed to load currencies. Please try again later.');
        });
});

function formatState2(state2) {
    if (!state2.id) {
        return state2.text; // Return text for placeholder (no id)
    }

    // Find the option element that matches the current state2.id
    const $option2 = $(`#currency2 option[value="${state2.id}"]`);
    const tradeSymbol2 = $option2.data('tradeSymbol'); // Retrieve tradeSymbol from data attribute

    const $state2 = $(
        `<span><img src="/img/assets/${tradeSymbol2}.svg" alt="${state2.text}" style="width: 20px; height: 20px; vertical-align: middle;" /> ${state2.text}</span>`
    );
    return $state2;
}

//change trading view widget to match selected currency
let tradingWidget2;

// Function to initialize the TradingView widget
function initializeWidget2(symbol2) {
    if (tradingWidget2) {
        tradingWidget2.remove(); // Remove the existing widget
    }

    tradingWidget2 = new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": symbol2,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "rgba(0, 0, 0, 0)",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_1a2b3c4d"
    });
}

// Function to update the TradingView widget with the selected tradeSymbol
function updateTradingViewWidget2() {
    const tradeType2 = $('#tradetype2').val(); // Get the current tradeType
    const selectedOption2 = $('#currency2').find(':selected');
    const tradeSymbol2 = selectedOption2.data('tradeSymbol'); // Get tradeSymbol from the selected option

    if (tradeSymbol2) {
        let fullSymbol2;
        if (tradeType2 === 'Crypto') {
            fullSymbol2 = `BINANCE:${tradeSymbol2}USD`; // Compare with USD for Crypto
        } else {
            fullSymbol2 = tradeSymbol2; // Use the tradeSymbol directly for other types
        }
        initializeWidget2(fullSymbol2); // Pass the fullSymbol to the TradingView widget
    } else {
        alert('Please select a valid trading symbol.');
    }
}

// Example usage: update when the select changes or when a button is clicked
$('#currency2').on('change', updateTradingViewWidget2);

//maps crypto for api search
const cryptoMapping2 = {
    'Bitcoin': 'bitcoin',
    'Ethereum': 'ethereum',
    'Litecoin': 'litecoin',
    'Polygon': 'matic-network',
    'Dash': 'dash',
    'Orion Protocol': 'orion-protocol',
    'Tether': 'tether',
    'USD Coin': 'usd-coin',
    'Polkadot': 'polkadot',
    'Ripple': 'ripple',
    'Cardano': 'cardano',
    'Dogecoin': 'dogecoin',
    'Solana': 'solana',
    'Aurora': 'aurora',
    'Boring DAO': 'boringdao',
    'Bitcoin Cash': 'bitcoin-cash',
    'AAVE': 'aave',
    'Shiba Inu': 'shiba-inu',
    'Dai': 'dai',
    'Origin Protocol': 'origin-protocol',
    'Tron': 'tron'
};

// Event listener for when the user changes the trade type (Crypto, Forex, Stocks)
$('#tradetype2').on('change', function() {
    const tradeType2 = $(this).val();
    const assetPriceElement2 = $('.displayprice2'); // Selects the <small>$0</small> span

    // Clear the current asset price
    assetPriceElement2.text("$0");

    // Fetch and display the price when the asset is selected
    $('#currency2').on('change', function() {
        const asset2 = $(this).val();
        
        const selectedCrypto2 = $(this).val(); // This gets the selected cryptocurrency name from the select element
        const tradeType2 = $('#tradetype2').val(); // Get the selected trade type (Crypto, Forex, Stocks)

        if (tradeType2 === 'Crypto') {
            const cryptoId2 = cryptoMapping2[selectedCrypto2];
            if (cryptoId2) {
                const apiUrl2 = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId2}&vs_currencies=usd`;

                fetch(apiUrl2)
                    .then(response => response.json())
                    .then(data2 => {
                        const price2 = data2[cryptoId2].usd;
                        $('.displayprice2').text(`$${price2}`);
                    })
                    .catch(error2 => console.error('Error fetching asset price:', error2));
            } else {
                console.error('Selected cryptocurrency not found in mapping.');
            }
        } else if (tradeType2 === "Forex") {
            // For Forex, using ExchangeRate-API
            const baseCurrency2 = asset2.substring(0, 3); // Extracts the base currency (e.g., GBP from GBPUSD)
            const targetCurrency2 = asset2.substring(3);  // Extracts the target currency (e.g., USD from GBPUSD)
            const apiUrl2 = `https://v6.exchangerate-api.com/v6/d92788cf8915bf9175829158/latest/${baseCurrency2}`;

            fetch(apiUrl2)
                .then(response => response.json())
                .then(data2 => {
                    if (data2 && data2.conversion_rates && data2.conversion_rates[targetCurrency2]) {
                        const price2 = data2.conversion_rates[targetCurrency2];
                        assetPriceElement2.text(`$${price2}`);
                    } else {
                        console.error('Error: Forex data not found');
                    }
                })
                .catch(error2 => console.error('Error fetching asset price:', error2));
        } else if (tradeType2 === "Stocks") {
            // For Stocks, using Alpha Vantage API
            apiUrl2 = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${asset2}&apikey=YOUR_API_KEY`;

            fetch(apiUrl2)
                .then(response => response.json())
                .then(data2 => {
                    if (data2["Global Quote"] && data2["Global Quote"]["05. price"] !== undefined) {
                        const price2 = data2["Global Quote"]["05. price"];
                        assetPriceElement2.text(`$${parseFloat(price2).toFixed(2)}`);
                    } else {
                        console.error('Error: Stock data not found');
                    }
                })
                .catch(error => console.error('Error fetching asset price:', error));
        }
    });
});

//add search bar to select2
$(document).ready(function() {
    $('#currency2').select2({
        placeholder: 'Select Asset',
        allowClear: true,
        templateResult: formatState2,
        templateSelection: formatState2,
        dropdownCssClass: 'custom-dropdown2'
    });
});

// Use to display the value of the selected asset
function searchCurrencyValue2() {
    const selectedAsset2 = $('#currency2').val();
    const assetDisplay2 = $('#asset-display2'); // The area where the amount is displayed
    assetDisplay2.text(selectedAsset2); // Update the display area with the selected asset
}

$('#currency2').on('change', searchCurrencyValue2);

$(document).ready(function() {
    $('#currency2').on('change', function() {
        var tradeCurrency = $(this).val(); // Get the selected value
        if (tradeCurrency) {
            $.ajax({
                url: '/check-currency/' + encodeURIComponent(tradeCurrency),
                method: 'GET',
                success: function(response) {
                    // Update the .displayfrom-currencysymbol p tag with the tradeSymbol from the response
                    $('#selldisplayasset').text(response.tradeSymbol);
                }})};
        
})})