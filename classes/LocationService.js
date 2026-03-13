/**
 * Singleton-service för att hämta användarens GPS-position via Geolocation API.
 * @namespace
 */
const LocationService = (function () {
  /** @type {?{fetchPosition: function(function(?Object, ?string):void), getPosition: function():?Object, getError: function():?string}} Privat referens till singleton-instansen */
  let instance = null;

  /**
   * Skapar den interna instansen av GPSService.
   * @private
   * @returns {{fetchPosition: function(function(?Object, ?string):void), getPosition: function():?Object, getError: function():?string}}
   */
  function createInstance() {
    /** @type {?Object} Senast hämtade position */
    let position = null;
    /** @type {?string} Senaste felmeddelandet */
    let error = null;

    console.log("GPSService: Instans skapad");

    return {
      /**
       * Hämtar användarens aktuella position via Geolocation API.
       * @param {function(?Object, ?string):void} callback Callback som returnerar position eller fel
       */
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

      /**
       * Hämtar senast sparad position.
       * @returns {?Object} Senast hämtade position eller null
       */
      getPosition: function () {
        console.log("GPSService: getPosition anropad", position);
        return position;
      },

      /**
       * Hämtar senaste felmeddelande.
       * @returns {?string} Senaste felmeddelande eller null
       */
      getError: function () {
        console.log("GPSService: getError anropad", error);
        return error;
      }
    };
  }

  return {
    /**
     * Hämtar singleton-instansen av GPSService.
     * Skapar instansen första gången den anropas.
     * @returns {{fetchPosition: function(function(?Object, ?string):void), getPosition: function():?Object, getError: function():?string}}
     */
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