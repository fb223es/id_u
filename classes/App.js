/**
 * Applikationens huvudklass
 * @constructor
 * @param {{latitude:number, longitude:number}} position
 */
function App(position) {

  if (!position) {
    console.error("Ingen position skickades till App");
    return;
  }

  /** @type {{latitude:number, longitude:number}} */
  this.position = position;

  /** @type {!GeoNamesService} */
  this.geoService = new GeoNamesService("fridooow99");

  /** @type {!CountryApi} */
  this.countryApi = new CountryApi();

  /** @type {!UIController} */
  this.ui = new UIController("countryInfo", "shakeMessageContainer");

  /** @type {!DeviceMotionService} */
  this.motionService = new DeviceMotionService();

  /** @type {?Object} */
  this.country = null;

  /** @type {?number} */
  this.rate = null;

  /** @type {?Object<string,number>} */
  this.availableRates = null;

  this.init();
}


/**
 * Initierar appen
 * @return {!Promise<void>}
 */
App.prototype.init = async function () {

  const self = this;

  this.switchBtn();
  this.initConverter();

  document.body.addEventListener(
    "click",
    function () {

      self.motionService.start(function () {
        self.onShake();
      });

    },
    { once: true }
  );

  try {

    const code = await this.geoService.getCountryCode(
      this.position.latitude,
      this.position.longitude
    );

    /** @type {!Array<!Object>} */
    const countryData = await this.countryApi.getCountryByCode(code);

    if (!countryData || !countryData[0]) {
      throw new Error("Landdata saknas");
    }

    this.country = countryData[0];

    this.ui.renderCountry(
      /** @type {{flags:{png:string},name:{common:string}}} */ (this.country),
      this.position
    );

    const countries = await this.countryApi.getAllCountries();

    const response = await fetch("currency_proxy.php?base=USD");

    /** @type {{rates: !Object<string,number>}} */
    const ratesData =
      /** @type {{rates: !Object<string,number>}} */ (await response.json());

    this.availableRates = {};

    Object.keys(ratesData.rates).forEach((k) => {

      this.availableRates[k.toUpperCase()] =
        parseFloat(ratesData.rates[k]);

    });

    this.ui.renderCurrencies(
      countries,
      /** @type {{currencies: !Object<string,{name:string}>}} */ (this.country),
      this,
      this.availableRates
    );

  }
  catch (err) {

    console.error(err);

  }

};


/**
 * Hanterar skakning
 */
App.prototype.onShake = function () {

  if (document.activeElement) {
    document.activeElement.blur();
  }

  this.switchCurrencies();

};


/**
 * Hämtar valutakurs
 * @return {!Promise<void>}
 */
App.prototype.loadRate = async function () {

  const base =
    /** @type {!HTMLSelectElement} */
    (document.getElementById("baseCurrency")).value.toUpperCase();

  const target =
    /** @type {!HTMLSelectElement} */
    (document.getElementById("targetCurrency")).value.toUpperCase();

  if (!base || !target) return;

  const response = await fetch(
    `currency_proxy.php?base=${base}&symbols=${target}`
  );

  /** @type {{rates: !Object<string,number>}} */
  const data =
    /** @type {{rates: !Object<string,number>}} */ (await response.json());

  const key = Object.keys(data.rates)
    .find((k) => k.toUpperCase() === target);

  if (!key) return;

  this.rate = parseFloat(data.rates[key]);

  this.ui.updateCurrencyDropdowns(base, target);

};


/**
 * Initierar converter inputs
 */
App.prototype.initConverter = function () {

  const baseInput =
    /** @type {!HTMLInputElement} */
    (document.getElementById("inB"));

  const targetInput =
    /** @type {!HTMLInputElement} */
    (document.getElementById("inM"));

  function sanitizeNumber(value) {

    value = value.replace(/[^0-9.]/g, "");

    const parts = value.split(".");

    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }

    if (value.startsWith(".")) {
      value = value.substring(1);
    }

    return value;

  }

  baseInput.addEventListener("input", (e) => {

    const src =
      /** @type {!HTMLInputElement} */
      (e.target);

    src.value = sanitizeNumber(src.value);

    const value = parseFloat(baseInput.value);

    if (isNaN(value) || !this.rate) {
      targetInput.value = "";
      return;
    }

    targetInput.value = (value * this.rate).toFixed(2);

  });

  targetInput.addEventListener("input", (e) => {

    const src =
      /** @type {!HTMLInputElement} */
      (e.target);

    src.value = sanitizeNumber(src.value);

    const value = parseFloat(targetInput.value);

    if (isNaN(value) || !this.rate) {
      baseInput.value = "";
      return;
    }

    baseInput.value = (value / this.rate).toFixed(2);

  });

};


/**
 * Byter valutor
 */
App.prototype.switchCurrencies = function () {

  const inB =
    /** @type {!HTMLInputElement} */
    (document.getElementById("inB"));

  const inM =
    /** @type {!HTMLInputElement} */
    (document.getElementById("inM"));

  const bv = document.getElementById("bv");
  const mv = document.getElementById("mv");

  const baseSelect =
    /** @type {!HTMLSelectElement} */
    (document.getElementById("baseCurrency"));

  const targetSelect =
    /** @type {!HTMLSelectElement} */
    (document.getElementById("targetCurrency"));

  [inB.value, inM.value] = [inM.value, inB.value];
  [bv.innerText, mv.innerText] = [mv.innerText, bv.innerText];
  [baseSelect.value, targetSelect.value] =
    [targetSelect.value, baseSelect.value];

  if (this.rate) {
    this.rate = 1 / this.rate;
  }

};


/**
 * Switch-knapp
 */
App.prototype.switchBtn = function () {

  const btn = document.getElementById("Switch");

  btn.addEventListener("click", () => {

    this.switchCurrencies();

  });

};