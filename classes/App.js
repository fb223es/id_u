
/**
 * @constructor
 * @param {{latitude:number, longitude:number}|null} position
 */
function App(position) {

  if (!position) {
    const ui = new UIController("countryInfo");
    ui.showError("Kunde inte hämta position");
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

  /**
   * @type {{
   *   flags: {png: string},
   *   name: {common: string},
   *   currencies: (?Object<string,{name:string}>)
   * }|null}
   */
  this.country = null;

  /** @type {?number} */
  this.rate = null;

  /** @type {?Object<string, number>} */
  this.availableRates = null;

  this.init();
}


/**
 * @return {!Promise<void>}
 */
App.prototype.init = async function () {

  const self = this;

  this.switchBtn();
  this.initConverter();

  document.body.addEventListener("click", function () {
    self.motionService.start(function () {
      self.onShake();
    });
  }, { once: true });

  try {

    const code = await this.geoService.getCountryCode(
      this.position.latitude,
      this.position.longitude
    );

    const countryData = await this.countryApi.getCountryByCode(code);

    if (!countryData || !countryData[0]) return;

    /** @type {{
     *   flags: {png: string},
     *   name: {common: string},
     *   currencies: (?Object<string,{name:string}>)
     * }} */
    this.country = /** @type {{
      flags: {png: string},
      name: {common: string},
      currencies: (?Object<string,{name:string}>)
    }} */ (countryData[0]);

    this.ui.renderCountry(this.country, this.position);

    const countries = await this.countryApi.getAllCountries();

    const response = await fetch("currency_proxy.php?base=USD");

    /** @type {{rates: (?Object<string, number>)}} */
    const ratesData = /** @type {{rates: (?Object<string, number>)}} */ (await response.json());

    if (!ratesData.rates) return;

    /** @type {!Object<string, number>} */
    const formattedRates = {};

    for (const key in ratesData.rates) {
      if (ratesData.rates.hasOwnProperty(key)) {
        formattedRates[key.toUpperCase()] =
          Number(ratesData.rates[key]);
      }
    }

    this.availableRates = formattedRates;

    this.ui.renderCurrencies(
      countries,
      this.country,
      this,
      formattedRates
    );

  } catch (e) {
    this.ui.showError("Fel vid laddning");
  }
};


/**
 * @return {void}
 */
App.prototype.onShake = function () {
  if (document.activeElement) {
    document.activeElement.blur();
  }
  this.switchCurrencies();
};


/**
 * @return {!Promise<void>}
 */
App.prototype.loadRate = async function () {

  const base = /** @type {?HTMLSelectElement} */ (
    document.getElementById("baseCurrency")
  );

  const target = /** @type {?HTMLSelectElement} */ (
    document.getElementById("targetCurrency")
  );

  if (!base || !target) return;

  const baseVal = base.value.toUpperCase();
  const targetVal = target.value.toUpperCase();

  const response = await fetch(
    "currency_proxy.php?base=" + baseVal + "&symbols=" + targetVal
  );

  /** @type {{rates: (?Object<string, number>)}} */
  const data = /** @type {{rates: (?Object<string, number>)}} */ (await response.json());

  if (!data.rates) return;

  const key = Object.keys(data.rates).find(function (k) {
    return k.toUpperCase() === targetVal;
  });

  if (!key) return;

  this.rate = Number(data.rates[key]);

  this.ui.updateCurrencyDropdowns(baseVal, targetVal);
};


/**
 * @return {void}
 */
App.prototype.initConverter = function () {

  const baseInput = /** @type {?HTMLInputElement} */ (
    document.getElementById("inB")
  );

  const targetInput = /** @type {?HTMLInputElement} */ (
    document.getElementById("inM")
  );

  if (!baseInput || !targetInput) return;

  const sanitize = function (v) {
    return v.replace(/[^0-9.]/g, "");
  };

  const self = this;

  baseInput.addEventListener("input", function (e) {
    const el = /** @type {!HTMLInputElement} */ (e.target);
    el.value = sanitize(el.value);

    const val = parseFloat(baseInput.value);

    if (!isNaN(val) && self.rate) {
      targetInput.value = (val * self.rate).toFixed(2);
    }
  });

  targetInput.addEventListener("input", function (e) {
    const el = /** @type {!HTMLInputElement} */ (e.target);
    el.value = sanitize(el.value);

    const val = parseFloat(targetInput.value);

    if (!isNaN(val) && self.rate) {
      baseInput.value = (val / self.rate).toFixed(2);
    }
  });
};


/**
 * @return {void}
 */
App.prototype.switchCurrencies = function () {

  const inB = /** @type {?HTMLInputElement} */ (document.getElementById("inB"));
  const inM = /** @type {?HTMLInputElement} */ (document.getElementById("inM"));
  const bv = /** @type {?HTMLElement} */ (document.getElementById("bv"));
  const mv = /** @type {?HTMLElement} */ (document.getElementById("mv"));

  const baseSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("baseCurrency"));
  const targetSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("targetCurrency"));

  if (!inB || !inM || !bv || !mv || !baseSelect || !targetSelect) return;

  const temp = inB.value;
  inB.value = inM.value;
  inM.value = temp;

  const tempText = bv.innerText;
  bv.innerText = mv.innerText;
  mv.innerText = tempText;

  const tempSelect = baseSelect.value;
  baseSelect.value = targetSelect.value;
  targetSelect.value = tempSelect;

  if (this.rate) {
    this.rate = 1 / this.rate;
  }
};


/**
 * @return {void}
 */
App.prototype.switchBtn = function () {

  const btn = /** @type {?HTMLElement} */ (
    document.getElementById("Switch")
  );

  if (!btn) return;

  const self = this;

  btn.addEventListener("click", function () {
    self.switchCurrencies();
  });
};