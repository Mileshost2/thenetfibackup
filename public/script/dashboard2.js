const cryptoMapping3 = {
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

function updateUsdValue() {
    var assetAmount = parseFloat($('#from-amount').val()) || 0;
    var currentPrice = parseFloat($('.displayfrom-currencyprice').text().replace('$', '')) || 0;
    
    // Calculate the USD value
    const usdValue = (assetAmount * currentPrice).toFixed(2);

    // Fetch the symbol from the `.displayfrom-currencysymbol` p tag
    const assetSymbol = $('.displayfrom-currencysymbol').text().trim();

    // Update the USD value and amount with the symbol
    $('.displayfrom-currencyusdvalue').text(`$${usdValue}`);
    $('.displayfrom-amount').html(`${assetAmount} <small>${assetSymbol}</small>`);
}

function updateToUsdValue() {
    var assetAmount = parseFloat($('#to-amount').val()) || 0;
    var currentPrice = parseFloat($('.displayto-currencyprice').text().replace('$', '')) || 0;
    
    // Calculate the USD value
    const usdValue = (assetAmount * currentPrice).toFixed(2);

    // Fetch the symbol from the `.displayto-currencysymbol` p tag
    const assetSymbol = $('.displayto-currencysymbol').text().trim();

    // Update the USD value and amount with the symbol
    $('.displayto-currencyusdvalue').text(`$${usdValue}`);
    $('.displayto-amount').html(`${assetAmount} <small>${assetSymbol}</small>`);
}

$(document).ready(function() {
    $('#from-currency').on('change', function() {
        var tradeCurrency = $(this).val(); // Get the selected value

        // Only proceed if tradeCurrency is not empty
        if (tradeCurrency) {
            $.ajax({
                url: '/check-currency/' + encodeURIComponent(tradeCurrency),
                method: 'GET',
                success: function(response) {
                    // Update the #from-cryptotype input field with the tradeType from the response
                    $('#from-cryptotype').val(response.tradeType);

                    // Update the .displayfrom-currencysymbol p tag with the tradeSymbol from the response
                    $('.displayfrom-currencysymbol').text(response.tradeSymbol);

                    // Fetch and display the current price based on tradeType
                    var assettradeType = response.tradeType; // Assuming tradeType is returned in the response
                    var asset3 = response.tradeCurrency; // Assuming tradeCurrency is used to identify the asset3
                    var asset3Symbol = response.tradeSymbol;
                    
                    if (assettradeType === 'Crypto') {
                        const cryptoId3 = cryptoMapping3[asset3];
                        if (cryptoId3) {
                            const apiUrl3 = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId3}&vs_currencies=usd`;

                            fetch(apiUrl3)
                                .then(response => response.json())
                                .then(data3 => {
                                    const price = data3[cryptoId3].usd;
                                    $('.displayfrom-currencyprice').text(`$${price}`);

                                    // Update the USD value based on the amount
                                updateUsdValue();
                                })
                                .catch(error => console.error('Error fetching cryptocurrency price:', error));
                        } else {
                            console.error('Selected cryptocurrency not found in mapping.');
                            $('.displayfrom-currencyprice').text('Price not available');
                        }
                    } else if (assettradeType === 'Stocks') {
                        console.log(asset3Symbol)
                        const apiUrl3 = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${asset3Symbol}&apikey=9FV394PG5QI2PK0T`;

                        fetch(apiUrl3)
                            .then(response => response.json())
                            .then(data3 => {
                                console.log('Stock data:', data3); // Log the response for debugging
                                const globalQuote = data3["Global Quote"];
                                if (globalQuote && globalQuote["05. price"]) {
                                    const price3 = globalQuote["05. price"];
                                    $('.displayfrom-currencyprice').text(`$${parseFloat(price3).toFixed(2)}`);

                                    // Update the USD value based on the amount
                                updateUsdValue();
                                } else {
                                    console.error('Error: Stock data not found');
                                    $('.displayfrom-currencyprice').text('Price not available');
                                }
                            })
                    } else {
                        $('.displayfrom-currencyprice').text('Price not available');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error fetching asset3:', error);
                    // Optionally, clear the input fields and price display on error
                    $('#from-cryptotype').val('');
                    $('.displayfrom-currencysymbol').text('');
                    $('.displayfrom-currencyprice').text('');
                }
            });
        } else {
            // Clear the input fields and price display if no tradeCurrency is selected
            $('#from-cryptotype').val('');
            $('.displayfrom-currencysymbol').text('');
            $('.displayfrom-currencyprice').text('');
        }
    });
});

$(document).ready(function() {
    $('#to-currency').on('change', function() {
        var tradeCurrency = $(this).val(); // Get the selected value

        // Only proceed if tradeCurrency is not empty
        if (tradeCurrency) {
            $.ajax({
                url: '/check-currency/' + encodeURIComponent(tradeCurrency),
                method: 'GET',
                success: function(response) {
                    // Update the #to-cryptotype input field with the tradeType to the response
                    $('#to-cryptotype').val(response.tradeType);

                    // Update the .displayto-currencysymbol p tag with the tradeSymbol to the response
                    $('.displayto-currencysymbol').text(response.tradeSymbol);

                    // Fetch and display the current price based on tradeType
                    var assettradeType = response.tradeType; // Assuming tradeType is returned in the response
                    var asset3 = response.tradeCurrency; // Assuming tradeCurrency is used to identify the asset3
                    var asset3Symbol = response.tradeSymbol;
                    
                    if (assettradeType === 'Crypto') {
                        const cryptoId3 = cryptoMapping3[asset3];
                        if (cryptoId3) {
                            const apiUrl3 = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId3}&vs_currencies=usd`;

                            fetch(apiUrl3)
                                .then(response => response.json())
                                .then(data3 => {
                                    const price = data3[cryptoId3].usd;
                                    $('.displayto-currencyprice').text(`$${price}`);
                                    // Update the USD value based on the amount
                                updateToUsdValue();
                                })
                                .catch(error => console.error('Error fetching cryptocurrency price:', error));
                        } else {
                            console.error('Selected cryptocurrency not found in mapping.');
                            $('.displayto-currencyprice').text('Price not available');
                        }
                    } else if (assettradeType === 'Stocks') {
                        console.log(asset3Symbol)
                        const apiUrl3 = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${asset3Symbol}&apikey=YOUR_API_KEY`;

                        fetch(apiUrl3)
                            .then(response => response.json())
                            .then(data3 => {
                                console.log('Stock data:', data3); // Log the response for debugging
                                const globalQuote = data3["Global Quote"];
                                if (globalQuote && globalQuote["05. price"]) {
                                    const price3 = globalQuote["05. price"];
                                    $('.displayto-currencyprice').text(`$${parseFloat(price3).toFixed(2)}`);

                                    // Update the USD value based on the amount
                                updateToUsdValue();
                                } else {
                                    console.error('Error: Stock data not found');
                                    $('.displayto-currencyprice').text('Price not available');
                                }
                            })
                    } else {
                        $('.displayto-currencyprice').text('Price not available');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error fetching asset3:', error);
                    // Optionally, clear the input fields and price display on error
                    $('#to-cryptotype').val('');
                    $('.displayto-currencysymbol').text('');
                    $('.displayto-currencyprice').text('');
                }
            });
        } else {
            // Clear the input fields and price display if no tradeCurrency is selected
            $('#to-cryptotype').val('');
            $('.displayto-currencysymbol').text('');
            $('.displayto-currencyprice').text('');
        }
    });
});



// Event listener for amount input change
$('#from-amount').on('input', function() {
    updateUsdValue();
});

// Event listener for amount input change
$('#to-amount').on('input', function() {
    updateToUsdValue();
});


function updateConversionResult() {
    // Get the USD value from the .displayfrom-currencyusdvalue element
    var fromUsdValue = parseFloat($('.displayfrom-currencyusdvalue').text().replace('$', '')) || 0;

    // Get the price value from the .displayto-currencyprice element
    var toCurrencyPrice = parseFloat($('.displayto-currencyprice').text().replace('$', '')) || 0;

    // Calculate the conversion result
    var conversionResult = (fromUsdValue / toCurrencyPrice).toFixed(2); // Adjust the precision as needed

    // Update the #to-amount input with the conversion result
    $('#to-amount').val(conversionResult);
}

// Update both USD values and the conversion result when from-amount changes
$('#from-amount').on('input', function() {
    updateUsdValue();
    updateConversionResult();
});

// Update the conversion result when to-amount changes (if required)
$('#to-amount').on('input', function() {
    updateToUsdValue();
});

// Update the conversion result when the selected currency in from-currency changes
$('#from-currency').on('change', function() {
    updateUsdValue();
    updateConversionResult();
});

// Update the conversion result when the selected currency in to-currency changes
$('#to-currency').on('change', function() {
    updateToUsdValue();
    updateConversionResult();
});

$(document).ready(function() {
    // Initial calculation when the page loads
    updateUsdValue();
    updateToUsdValue();
    updateConversionResult();
});
