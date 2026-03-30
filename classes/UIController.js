/**
 * UIController hanterar rendering av land, flagga, felmeddelanden och valutaval i UI.
 * @constructor
 * @param {string} containerId
 * @param {string=} outputElementId
 */
function UIController(containerId, outputElementId) {

  /** @type {string} */
  this.outputElementId = outputElementId || "countryInfo";

  /** @type {?HTMLElement} */
  this.container = /** @type {?HTMLElement} */ (document.getElementById(containerId));

  /** @type {!Object<string,string>} */
  this.currencies = {};
}

/**
 * Visa felmeddelande
 * @param {string} message
 * @return {void}
 */
UIController.prototype.showError = function(message) {

  /** @type {?HTMLElement} */
  const output = /** @type {?HTMLElement} */ (document.getElementById(this.outputElementId));
  if (!output) return;

  output.innerHTML = "";

  /** @type {!HTMLParagraphElement} */
  const error = /** @type {!HTMLParagraphElement} */ (document.createElement("p"));
  error.style.color = "red";
  error.innerText = message;

  output.appendChild(error);
};

/**
 * Rendera land + flagga + koordinater
 * @param {?{name:{common:string}, flags:{png:string}}} country
 * @param {?{latitude:number, longitude:number}} position
 * @return {void}
 */
UIController.prototype.renderCountry = function(country, position) {

  /** @type {?HTMLElement} */
  const output = /** @type {?HTMLElement} */ (document.getElementById(this.outputElementId));
  if (!output || !country) return;

  output.innerHTML = "";

  /** @type {!HTMLDivElement} */
  const container = /** @type {!HTMLDivElement} */ (document.createElement("div"));

  /** @type {!HTMLHeadingElement} */
  const title = /** @type {!HTMLHeadingElement} */ (document.createElement("h3"));
  title.innerText = country.name.common;

  /** @type {!HTMLImageElement} */
  const flag = /** @type {!HTMLImageElement} */ (document.createElement("img"));
  flag.src = country.flags.png;
  flag.alt = country.name.common + " flag";

  container.appendChild(title);
  container.appendChild(flag);

  if (position) {

    /** @type {!HTMLParagraphElement} */
    const coords = /** @type {!HTMLParagraphElement} */ (document.createElement("p"));

    coords.innerText =
      "Lat: " + position.latitude.toFixed(4) +
      ", Lng: " + position.longitude.toFixed(4);

    container.appendChild(coords);
  }

  output.appendChild(container);
};

/**
 * Rendera valutor
 * @param {!Array<{currencies:?Object<string,{name:string}>}>} countries
 * @param {?{currencies:?Object<string,{name:string}>}} userCountry
 * @param {{loadRate: function(): (!Promise<void>|void)}} app
 * @param {?Object<string, number>} availableRates
 * @return {void}
 */
UIController.prototype.renderCurrencies = function(countries, userCountry, app, availableRates) {

  /** @type {?HTMLSelectElement} */
  const baseSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("baseCurrency"));

  /** @type {?HTMLSelectElement} */
  const targetSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("targetCurrency"));

  /** @type {?HTMLInputElement} */
  const baseInput = /** @type {?HTMLInputElement} */ (document.getElementById("inB"));

  /** @type {?HTMLInputElement} */
  const targetInput = /** @type {?HTMLInputElement} */ (document.getElementById("inM"));

  /** @type {?HTMLElement} */
  const bv = /** @type {?HTMLElement} */ (document.getElementById("bv"));

  /** @type {?HTMLElement} */
  const mv = /** @type {?HTMLElement} */ (document.getElementById("mv"));

  if (!baseSelect || !targetSelect || !availableRates) return;

  baseSelect.innerHTML = "";
  targetSelect.innerHTML = "";
  this.currencies = {};

  for (let i = 0; i < countries.length; i++) {

    let country = countries[i];

    if (!country.currencies) continue;

    for (let code in country.currencies) {

      code = code.toUpperCase();

      if (!this.currencies[code] && availableRates[code]) {
        this.currencies[code] = country.currencies[code].name;
      }
    }
  }

  /** @type {!HTMLOptionElement} */
  const placeholderBase = /** @type {!HTMLOptionElement} */ (document.createElement("option"));
  placeholderBase.value = "";
  placeholderBase.textContent = "-- Välj basvaluta --";
  placeholderBase.disabled = true;
  placeholderBase.selected = true;
  baseSelect.appendChild(placeholderBase);

  /** @type {!HTMLOptionElement} */
  const placeholderTarget = /** @type {!HTMLOptionElement} */ (document.createElement("option"));
  placeholderTarget.value = "";
  placeholderTarget.textContent = "-- Välj målvaluta --";
  placeholderTarget.disabled = true;
  placeholderTarget.selected = true;
  targetSelect.appendChild(placeholderTarget);

  for (let code in this.currencies) {

    /** @type {!HTMLOptionElement} */
    const optBase = /** @type {!HTMLOptionElement} */ (document.createElement("option"));
    optBase.value = code;
    optBase.textContent = code + " - " + this.currencies[code];
    baseSelect.appendChild(optBase);

    /** @type {!HTMLOptionElement} */
    const optTarget = /** @type {!HTMLOptionElement} */ (document.createElement("option"));
    optTarget.value = code;
    optTarget.textContent = code + " - " + this.currencies[code];
    targetSelect.appendChild(optTarget);
  }

  if (userCountry && userCountry.currencies) {

    let userCurrency = Object.keys(userCountry.currencies)[0].toUpperCase();

    if (availableRates[userCurrency]) {
      baseSelect.value = userCurrency;
      if (bv) bv.innerText = userCurrency + " - " + this.currencies[userCurrency];
    }
  }

  baseSelect.addEventListener("change", function() {

    if (bv && baseSelect.value) {
      bv.innerText = baseSelect.value + " - " + this.currencies[baseSelect.value];
    }

    if (baseInput) baseInput.value = "";
    if (targetInput) targetInput.value = "";

    if (baseSelect.value && targetSelect.value && app) {
      app.loadRate();
    }

  }.bind(this));

  targetSelect.addEventListener("change", function() {

    if (mv && targetSelect.value) {
      mv.innerText = targetSelect.value + " - " + this.currencies[targetSelect.value];
    }

    if (baseInput) baseInput.value = "";
    if (targetInput) targetInput.value = "";

    if (baseSelect.value && targetSelect.value && app) {
      app.loadRate();
    }

  }.bind(this));
};

/**
 * Uppdatera dropdowns
 * @param {string} base
 * @param {string} target
 * @return {void}
 */
UIController.prototype.updateCurrencyDropdowns = function(base, target) {

  /** @type {?HTMLSelectElement} */
  const baseSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("baseCurrency"));

  /** @type {?HTMLSelectElement} */
  const targetSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("targetCurrency"));

  /** @type {?HTMLElement} */
  const bv = /** @type {?HTMLElement} */ (document.getElementById("bv"));

  /** @type {?HTMLElement} */
  const mv = /** @type {?HTMLElement} */ (document.getElementById("mv"));

  if (baseSelect) baseSelect.value = base;
  if (targetSelect) targetSelect.value = target;

  if (bv && this.currencies[base]) {
    bv.innerText = base + " - " + this.currencies[base];
  }

  if (mv && this.currencies[target]) {
    mv.innerText = target + " - " + this.currencies[target];
  }
};