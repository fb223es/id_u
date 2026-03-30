/**
 * Klass som används för att hämta ut fakta om ett land
 * @constructor
 * @public
 * @extends ApiService
 */
function CountryApi() {
    ApiService.call(this, "https://restcountries.com/v3.1/");
}

// Ärver från abstrakta klassen ApiService
CountryApi.prototype = Object.create(ApiService.prototype);
CountryApi.prototype.constructor = CountryApi;

/**
 * Hämtar information om ett land baserat på ISO-landskod
 * Metoden skickar en request till REST Countries API
 * via klassens interna get()-metod.
 * @public
 * @param {string} code ISO 3166-1 alpha-2 eller alpha-3 landskod (ex: "SE", "US")
 * @returns {!Promise<!Array<!Object>>} Promise som returnerar en lista med landdata.
 *                                      Returnerar tom array om API-anropet misslyckas.
 */
CountryApi.prototype.getCountryByCode = function(code) {
    // Se till att this.get() returnerar ett Promise enligt APIService
    return /** @type {!Promise<!Array<!Object>>} */ (this.get("alpha/" + code))
        .then(function(data) {
            return data;
        })
        .catch(function(err) {
            return []; // Viktigt: alltid returnera array för Promise
        });
};

/**
 * Hämtar information om alla länder
 * @public
 * @returns {!Promise<!Array<!Object>>} Promise som returnerar en lista med landdata.
 *                                      Returnerar tom array om API-anropet misslyckas.
 */
CountryApi.prototype.getAllCountries = function () {
    return /** @type {!Promise<!Array<!Object>>} */ (
        fetch("https://restcountries.com/v3.1/all?fields=name,flags,currencies")
        .then(function(response) {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(function(data) {
            return data;
        })
        .catch(function(err) {
            return []; // Viktigt: alltid returnera array för Promise
        })
    );
};