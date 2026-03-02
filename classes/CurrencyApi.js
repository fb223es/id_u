//Klass för att hämta information om olika valutor

function CurrencyApi() {
    ApiService.call(this, "https://api.moneyconvert.net/");
}

CurrencyApi.prototype = Object.create(ApiService.prototype);
CurrencyApi.prototype.constructor = CurrencyApi;

CurrencyApi.prototype.getRates = function(baseCurrency) {
    return this.get("latest?base=" + baseCurrency);
};