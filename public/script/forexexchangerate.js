// This script search for forex pairs with a fixed usd base.

const apiKey = 'f845ca1e3b9a39c90cfc4eb5'; // Replace with your ExchangeRate-API.com API key
        const baseUrl = 'https://v6.exchangerate-api.com/v6/';
        const flagApiBaseUrl = 'https://flagcdn.com/';

        const currencyToCountry = {
            'USD': 'us',
            'EUR': 'eu',
            'JPY': 'jp',
            'GBP': 'gb',
            'CHF': 'ch',
            'AUD': 'au',
            'NZD': 'nz',
            'CAD': 'ca'
        };

        function fetchCurrencyData() {
        const url = `${baseUrl}${apiKey}/latest/USD`; // Assuming USD as base currency

        fetch(url)
            .then(response => response.json())
            .then(data => {
            const top10Pairs = [
                'EUR', 'JPY', 'GBP', 'CHF', 'AUD',
                'NZD', 'CAD', 'EUR', 'JPY', 'GBP' // Adjust pairs as needed
            ];

            const currencyContainer = document.getElementById('currency-container');

                top10Pairs.forEach(currency => {
                    const rate = data.conversion_rates[currency];
                    const countryCode = currencyToCountry[currency];

                    const currencyLink = document.createElement('a');
                    currencyLink.classList.add('currency');

                    const currencyImgBox = document.createElement('span');
                    currencyImgBox.classList.add('currencyimgbox');
                    const img = document.createElement('img');
                    img.src = `${flagApiBaseUrl}/20x15/${countryCode}.png`;
                    img.alt = `${currency} flag`;
                    const pairP = document.createElement('p');
                    pairP.textContent = `USD/${currency}`;
                    currencyImgBox.appendChild(img);
                    currencyImgBox.appendChild(pairP);

                    const currencyPrice = document.createElement('span');
                    currencyPrice.classList.add('currencyprice');
                    const priceP = document.createElement('p');
                    priceP.textContent = rate.toFixed(4);
                    currencyPrice.appendChild(priceP);

                    currencyLink.appendChild(currencyImgBox);
                    currencyLink.appendChild(currencyPrice);

                    currencyContainer.appendChild(currencyLink);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
        }

        fetchCurrencyData();