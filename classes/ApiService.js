// Grundklass för att hämta information från olika API:er
function ApiService(baseUrl) {
    this.baseUrl = baseUrl;
}

// Generisk GET-metod
ApiService.prototype.get = function(endpoint) {
    var self = this;

    return fetch(self.baseUrl + endpoint)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP error: " + response.status);
            }
            return response.json();
        })
        .catch(function(error) {
            console.error("API error:", error);
            throw error;
        });
};