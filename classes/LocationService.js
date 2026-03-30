// Api för att hämta in användarens gps-data för att avgöra vilket land personen befinner sig i.
let GPSService = (function () {
  let instance; // Privat referens till instansen

  function createInstance() {
    let position = null;
    let error = null;

    return {
      fetchPosition: function (callback) {

        if (!navigator.geolocation) {
          error = "Geolocation stöds inte av webbläsaren.";
          if (callback) callback(null, error);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          function (pos) {
            position = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            };

            if (callback) callback(position, null);
          },
          function (err) {
            error = err.message;
            if (callback) callback(null, error);
          },
        );
      },

      getPosition: function () {
        return position;
      },

      getError: function () {
        return error;
      },
    };
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      } else {
      }
      return instance;
    },
  };
})();
