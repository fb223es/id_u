// Använd let istället för var
let app = null;

/**
 * Huvudklass som startar applikationen.
 * @constructor
 */
function Main() {
  console.log("Main start");
  this.start();
}

/**
 * Startar applikationen genom att hämta användarens GPS-position.
 * Om positionen inte kan hämtas, startas App med null.
 * @returns {void}
 */
Main.prototype.start = function () {

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      /**
       * Callback som körs när positionen hämtats.
       * @param {?GeolocationPosition} pos Positionsobjekt från webbläsaren
       */
      function (pos) {

        const position = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };

        console.log("Position:", position);

        app = new App(position);

      },

      /**
       * Callback när GPS nekas
       * @param {?GeolocationPositionError} err
       */
      function (err) {

        console.log("GPS nekad");

        app = new App(
          /** @type {{latitude:number,longitude:number}} */ (null)
        );

      }

    );

  } else {

    console.log("Geolocation saknas");

    app = new App(
      /** @type {{latitude:number,longitude:number}} */ (null)
    );

  }

};

/**
 * Startar Main när sidan laddas
 */
window.onload = function () {
  new Main();
};