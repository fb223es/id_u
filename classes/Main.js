/**
 * Global app-instans
 * @type {?Object}
 */
let app = null;

/**
 * Main klass
 * @constructor
 */
function Main() {

  this.start();
}

/**
 * Startar applikationen och hämtar position
 * @return {void}
 */
Main.prototype.start = function () {

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      /**
       * @param {!GeolocationPosition} pos
       */
      function (pos) {

        /** @type {{latitude:number, longitude:number}} */
        const position = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };

        app = new App(position);

      },

      /**
       * @return {void}
       */
      function () {

        app = new App(null);

      }

    );

  } else {
    app = new App(null);

  }
};

/**
 * Initieras när sidan laddas
 * @return {void}
 */
window.onload = function () {
  new Main();
};