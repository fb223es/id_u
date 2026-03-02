// Api för att hämta in användarens gps-data för att avgöra vilket land personen befinner sig i.
var GPSService = (function () {

    var instance; // Privat referens till instansen

    function createInstance() {
        var position = null;
        var error = null;

        console.log("GPSService: Instans skapad");

        return {

            fetchPosition: function (callback) {
                console.log("GPSService: fetchPosition anropad");

                if (!navigator.geolocation) {
                    error = "Geolocation stöds inte av webbläsaren.";
                    console.log("GPSService Error:", error);
                    if (callback) callback(null, error);
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    function (pos) {
                        position = {
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                            timestamp: pos.timestamp
                        };

                        console.log("GPSService: position hämtad", position);

                        if (callback) callback(position, null);
                    },
                    function (err) {
                        error = err.message;
                        console.log("GPSService Error:", error);
                        if (callback) callback(null, error);
                    }
                );
            },

            getPosition: function () {
                console.log("GPSService: getPosition anropad", position);
                return position;
            },

            getError: function () {
                console.log("GPSService: getError anropad", error);
                return error;
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                console.log("GPSService: Skapar ny instans");
                instance = createInstance();
            } else {
                console.log("GPSService: Returnerar befintlig instans");
            }
            return instance;
        }
    };

})();