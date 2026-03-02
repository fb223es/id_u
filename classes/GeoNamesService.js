function GeoNamesService(username) {
    this.username = username || "fridooow99"; // fallback
}

GeoNamesService.prototype.getCountryCode = function(lat, lng) {
    return fetch("https://secure.geonames.org/countryCodeJSON?lat=" + lat + "&lng=" + lng + "&username=" + this.username)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            return data.countryCode; // t.ex. "SE"
        });
};