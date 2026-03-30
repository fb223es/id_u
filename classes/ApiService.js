/**
 * Grundklass för att hämta information från olika API:er
 * @constructor
 * @abstract 
 * @param {string} baseUrl - Den URL som ska användas för att få ut information från API:et
 * @public
 */
function ApiService(baseUrl) {
    this.baseUrl = baseUrl;
}

/**
 * Hämtar data från API:et för angiven endpoint och returnerar det som JSON.
 * @param {string} endpoint - Endpoint som ska användas för att hämta information
 * @public
 * @returns {!Object} JSON-data från API:et (alltid non-null)
 */
ApiService.prototype.get = function(endpoint) {
    let self = this;

    return fetch(self.baseUrl + endpoint)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP error: " + response.status);
            }
            return response.json();
        })
        .catch(function(error) {
            throw error;
        });
};