/**
 * ServiceWorkerManager hanterar registrering av Service Worker.
 * @constructor
 */
function ServiceWorkerManager() {}

/**
 * Registrerar Service Worker
 * @return {!Promise<void>}
 */
ServiceWorkerManager.prototype.register = async function () {

  if ("serviceWorker" in navigator) {

    try {

      await navigator.serviceWorker.register("classes/sw.js");

    } catch (err) {

    }

  }

};