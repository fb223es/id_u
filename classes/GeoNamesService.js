/**
 * Service för att hämta geografisk information från GeoNames API.
 * @constructor
 * @param {string=} username
 */
function GeoNamesService(username) {

  /** @type {string} */
  this.username = username || "fridooow99";

}


/**
 * Hämtar landskod baserat på latitud och longitud.
 * @param {number} lat
 * @param {number} lng
 * @return {!Promise<string>}
 */
GeoNamesService.prototype.getCountryCode = function(lat, lng) {

  return fetch(
    "https://secure.geonames.org/countryCodeJSON?lat=" +
    lat +
    "&lng=" +
    lng +
    "&username=" +
    this.username
  )

  .then(function(response) {

    return /** @type {!Promise<{countryCode:string}>} */ (response.json());

  })

  .then(function(data) {

    const geo =
      /** @type {{countryCode:string}} */ (data);

    return geo.countryCode;

  });

};