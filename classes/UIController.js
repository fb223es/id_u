/**
 * UIController hanterar rendering av land, flagga, felmeddelanden och valutaval i UI.
 * @constructor
 * @param {string} containerId ID för container-element.
 * @param {string=} outputElementId ID för element där landinfo visas. Standard: "countryInfo".
 */
function UIController(containerId, outputElementId = "countryInfo") {
  this.outputElementId = outputElementId;
  /** @type {?HTMLElement} */
  this.container = /** @type {?HTMLElement} */ (document.getElementById(containerId));
  /** @type {!Object.<string,string>} Mappning mellan valutakoder och namn */
  this.currencies = {};
}

/**
 * Renderar information om ett land och dess flagga i UI.
 * @param {?{name:{common:string}, flags:{png:string}}} country Landobjekt.
 * @param {?{latitude:number, longitude:number}} position Latitude/Longitude (valfritt).
 */
UIController.prototype.renderCountry = function(country, position) {
  const output = /** @type {?HTMLElement} */ (document.getElementById(this.outputElementId || "countryInfo"));
  if (!output) return;
  output.innerHTML = "";

  const container = document.createElement("div");

  const title = document.createElement("h3");
  title.innerText = country.name.common;

  /** @type {!HTMLImageElement} */
  const flag = /** @type {!HTMLImageElement} */ (document.createElement("img"));
  flag.src = country.flags.png;
  flag.alt = country.name.common + " flag";

  container.appendChild(title);
  container.appendChild(flag);

  if (position) {
    const coords = document.createElement("p");
    coords.innerText =
      "Lat: " + position.latitude.toFixed(4) +
      ", Lng: " + position.longitude.toFixed(4);
    container.appendChild(coords);
  }

  output.appendChild(container);
};

/**
 * Renderar valutalistor i dropdowns baserat på länder och användarens land.
 * @param {!Array<{currencies: ?Object.<string,{name:string}>}>} countries Lista med landobjekt.
 * @param {?{currencies: ?Object.<string,{name:string}>}} userCountry Användarens landobjekt.
 * @param {{ loadRate: function() }} app Applikationsobjekt.
 * @param {?Object<string, number>} availableRates Valutarates (valfritt).
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

  // Bygg lista med valutor som finns i både countries och availableRates
  countries.forEach(country => {
    if (!country.currencies) return;
    for (let code in country.currencies) {
      code = code.toUpperCase();
      if (!this.currencies[code] && availableRates[code]) {
        this.currencies[code] = country.currencies[code].name;
      }
    }
  });

  // Placeholder
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

  // Fyll dropdowns
  Object.keys(this.currencies).sort().forEach(code => {
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
  });

  // Sätt standardvaluta om användarland har
  if (userCountry && userCountry.currencies) {
    const userCurrency = Object.keys(userCountry.currencies)[0].toUpperCase();
    if (availableRates[userCurrency]) {
      baseSelect.value = userCurrency;
      if (bv) bv.innerText = userCurrency + " - " + this.currencies[userCurrency];
    }
  }

  // Event listeners
  baseSelect.addEventListener("change", () => {
    if (bv && baseSelect.value) bv.innerText = baseSelect.value + " - " + this.currencies[baseSelect.value];
    if (baseInput) baseInput.value = "";
    if (targetInput) targetInput.value = "";
    if (baseSelect.value && targetSelect.value && app) app.loadRate();
  });

  targetSelect.addEventListener("change", () => {
    if (mv && targetSelect.value) mv.innerText = targetSelect.value + " - " + this.currencies[targetSelect.value];
    if (baseInput) baseInput.value = "";
    if (targetInput) targetInput.value = "";
    if (baseSelect.value && targetSelect.value && app) app.loadRate();
  });
};

/**
 * Uppdaterar värden i valutadropdowns.
 * @param {string} base Valutakod för basvaluta.
 * @param {string} target Valutakod för målvärdet.
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