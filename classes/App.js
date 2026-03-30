/**
 * @typedef {{
 *  latitude:number,
 *  longitude:number
 * }}
 */
let Position;

/**
 * @typedef {{
 *  currencies:(!Object<string,{name:string}>|null|undefined),
 *  flags:{png:string},
 *  name:{common:string}
 * }}
 */
let Country;

/**
 * @typedef {{
 *  rates:(!Object<string,number>|null)
 * }}
 */
let RatesResponse;


// ===== HUVUDKLASS FÖR APPEN =====
/**
 * @constructor
 * @param {(!Position|null)=} position
 */
function App(position) {

  /** @type {(!Position|null)} */
  this.position = position || null;

  this.geoService = new GeoNamesService("fridooow99");
  this.countryApi = new CountryApi();
  this.ui = new UIController("countryInfo", "shakeMessageContainer");
  this.motionService = new DeviceMotionService();

  /** @type {?Country} */
  this.country = null;

  this.rate = null;
  this.availableRates = null;

  if (!this.position) {
    const container = document.getElementById("countryInfo");
    if (container) {
      const p = document.createElement("p");
      p.innerText =
        "Vi kan inte läsa in din position men du kan använda appen ändå";
      container.appendChild(p);
    }
  }

  this.init();
}


/**
 * ===== INITIERING =====
 * @return {!Promise<void>}
 */
App.prototype.init = async function () {

  const self = this;

  console.log("App init start");

  this.switchBtn();
  this.initConverter();

  document.body.addEventListener(
    "click",
    function () {

      console.log("User interaction detected - starting motion sensor");

      self.motionService.start(function (strength) {
        console.log("Shake detected strength:", strength);
        self.onShake();
      });
    },
    { once: true }
  );

  try {

    let code = null;

    if (this.position) {
      console.log("Hämtar landkod...");
      code = await this.geoService.getCountryCode(
        this.position.latitude,
        this.position.longitude
      );
    }

    /** @type {!Array<!Object>} */
    let countryData = [];

    if (code) {

      countryData = await this.countryApi.getCountryByCode(code);

      if (countryData && countryData[0]) {

        this.country = /** @type {!Country} */ (countryData[0]);

        this.ui.renderCountry(
          /** @type {!Country} */ (this.country),
          this.position || undefined
        );
      }
    }

    console.log("Hämtar alla länder...");

    const countries = await this.countryApi.getAllCountries();

    if (!countries || countries.length === 0) {
      throw new Error("Inga länder hämtade");
    }

    const response = await fetch("currency_proxy.php?base=USD");

    /** @type {!RatesResponse} */
    const ratesData =
      /** @type {!RatesResponse} */ (await response.json());

    if (!ratesData || !ratesData.rates) {
      throw new Error("Kunde inte hämta kurser");
    }

    this.availableRates = {};

    Object.keys(ratesData.rates).forEach((k) => {
      this.availableRates[k.toUpperCase()] =
        parseFloat(ratesData.rates[k]);
    });

    this.ui.renderCurrencies(
      countries,
      /** @type {?Country} */ (this.country),
      /** @type {{loadRate:function()}} */ (this),
      this.availableRates
    );

  } catch (err) {
    console.error("Fel vid initiering:", err);
  }
};


/**
 * ===== SKAK-FUNKTION =====
 * @return {void}
 */
App.prototype.onShake = function () {

  console.log("Telefonen skakades");

  if (document.activeElement) {
    document.activeElement.blur();
  }

  this.switchCurrencies();
};


/**
 * ===== HÄMTA VÄXLINGSKURS =====
 * @return {!Promise<void>}
 */
App.prototype.loadRate = async function () {

  const base =
    /** @type {!HTMLSelectElement} */
    (document.getElementById("baseCurrency")).value.toUpperCase();

  const target =
    /** @type {!HTMLSelectElement} */
    (document.getElementById("targetCurrency")).value.toUpperCase();

  if (!base || !target) {
    return;
  }

  try {

    const response = await fetch(
      `currency_proxy.php?base=${base}&symbols=${target}`
    );

    /** @type {!RatesResponse} */
    const data =
      /** @type {!RatesResponse} */ (await response.json());

    if (!data || !data.rates) {
      throw new Error("Kunde inte hämta kurs");
    }

    const key = Object.keys(data.rates)
      .find((k) => k.toUpperCase() === target);

    if (!key) {
      throw new Error("Kurs saknas");
    }

    this.rate = parseFloat(data.rates[key]);

    console.log("Rate:", this.rate);

    this.ui.updateCurrencyDropdowns(base, target);

  } catch (err) {
    console.error("Fel vid hämtning av kurs:", err);
  }
};


/**
 * ===== VALUTAOMVANDLARE =====
 * @return {void}
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

    const input =
      /** @type {!HTMLInputElement} */ (e.target);

    input.value = sanitizeNumber(input.value);

    const value = parseFloat(baseInput.value);

    targetInput.value =
      isNaN(value) || !this.rate
        ? ""
        : (value * this.rate).toFixed(2);
  });

  targetInput.addEventListener("input", (e) => {

    const input =
      /** @type {!HTMLInputElement} */ (e.target);

    input.value = sanitizeNumber(input.value);

    const value = parseFloat(targetInput.value);

    baseInput.value =
      isNaN(value) || !this.rate
        ? ""
        : (value / this.rate).toFixed(2);
  });
};


/**
 * ===== BYTA VALUTOR =====
 * @return {void}
 */
App.prototype.switchCurrencies = function () {

  const container = document.getElementById("result");

  container.classList.add("switch-animate");

  setTimeout(() => {
    container.classList.remove("switch-animate");
  }, 300);

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
 * ===== SWITCH KNAPP =====
 * @return {void}
 */
App.prototype.switchBtn = function () {

  const btn = document.getElementById("Switch");

  btn.addEventListener("click", () => {
    this.switchCurrencies();
  });
};