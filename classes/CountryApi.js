function CountryApi() {
    ApiService.call(this, "https://restcountries.com/v3.1/");
}

CountryApi.prototype = Object.create(ApiService.prototype);
CountryApi.prototype.constructor = CountryApi;

// Hämta land via landskod
CountryApi.prototype.getCountryByCode = function(code) {
    console.log("Hämtar land med kod:", code);
    return this.get("alpha/" + code)
        .then(function(data) {
            console.log("Landet hämtat:", data);
            return data;
        })
        .catch(function(err) {
            console.error("Fel vid hämtning av land:", err);
            return [];
        });
};

CountryApi.prototype.getAllCountries = function () {
    console.log("Hämtar alla länder...");
    return fetch("https://restcountries.com/v3.1/all?fields=name,flags,currencies")
        .then(function(response) {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(function(data) {
            console.log("Alla länder hämtade:", data.length);
            return data;
        })
        .catch(function(err) {
            console.error("Fel vid hämtning av alla länder:", err);
           
        });
};