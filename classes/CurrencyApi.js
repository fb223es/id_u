// CurrencyApi.js
function CurrencyApi() {}

CurrencyApi.prototype.getRatesForCountry = function(country) {
    const baseCurrency = Object.keys(country.currencies)[0];
    const symbols = "GBP,JPY,EUR";
    return fetch(`currency_proxy.php?base=${baseCurrency}&symbols=${symbols}`)
        .then(res => res.json());
};