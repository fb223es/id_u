function CountryApi() {
    ApiService.call(this, "https://restcountries.com/v3.1/");
}

CountryApi.prototype = Object.create(ApiService.prototype);
CountryApi.prototype.constructor = CountryApi;

CountryApi.prototype.getCountryByCode = function(code) {
    return this.get("alpha/" + code);
};