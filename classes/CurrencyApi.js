/**
 * Hämtar valutakurser från backend
 * @public
 */
function CurrencyApi() {}

/**
 * Hämtar valutakurser för ett specifikt land.
 * @param {{currencies: !Object<string,{name:string}>}} country - Landets data med valuta.
 * @return {!Promise<{rates: !Object<string, number>}>} En Promise som resolver med valutakurser.
 */
CurrencyApi.prototype.getRatesForCountry = function(country) {
    // Säkerställ att Object.keys alltid får ett giltigt objekt
    const baseCurrency = Object.keys(country.currencies || {})[0];
    const symbols = "GBP,JPY,EUR";

    // Returnerar Promise som resolver med JSON från backend
    return fetch(`currency_proxy.php?base=${baseCurrency}&symbols=${symbols}`)
        .then(res => res.json());
};