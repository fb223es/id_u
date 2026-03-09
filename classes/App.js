function App(position) {
  this.position = position || null;

  this.geoService = new GeoNamesService("fridooow99");
  this.countryApi = new CountryApi();
  this.ui = new UIController("countryInfo", "shakeMessageContainer");
  this.motionService = new DeviceMotionService();

  this.country = null;
  this.rate = null;
  this.availableRates = null;

  this.init();
}

App.prototype.init = async function() {
  const self = this;

  // Start switch-knapp
  this.switchBtn();

  // Start converter
  this.initConverter();

  // Start motion efter första klick (browserkrav)
  document.body.addEventListener("click", function() {
    self.motionService.start(function() {
      self.onShake();
    });
  }, { once: true });

  try {
    // ----- POSITION BARA OM TILLGÄNGLIG -----
    if (this.position) {
      try {
        const code = await this.geoService.getCountryCode(this.position.latitude, this.position.longitude);
        const countryData = await this.countryApi.getCountryByCode(code);
        if (countryData && countryData[0]) {
          this.country = countryData[0];
          this.ui.renderCountry(this.country, this.position);
        } else {
          this.ui.showError("Landdata saknas för din position.");
        }
      } catch (err) {
        console.error(err);
        this.ui.showError("Fel vid hämtning av position: " + err.message);
      }
    } else {
      this.ui.showError("Vi kan inte läsa in din position men du kan använda appen ändå.");
    }

    // ----- HÄMTA ALLA LÄNDER -----
    const countries = await this.countryApi.getAllCountries();
    if (!countries || countries.length === 0) throw new Error("Inga länder hämtade");

    // ----- HÄMTA VALUTAKURS -----
    const response = await fetch("currency_proxy.php?base=USD");
    const ratesData = await response.json();
    if (!ratesData || !ratesData.rates) throw new Error("Kunde inte hämta kurser");

    this.availableRates = {};
    Object.keys(ratesData.rates).forEach(k => this.availableRates[k.toUpperCase()] = parseFloat(ratesData.rates[k]));

    // ----- RENDER DROPDOWNS -----
    this.ui.renderCurrencies(countries, this.country, this, this.availableRates);

  } catch(err) {
    console.error("Fel vid initiering:", err);
    this.ui.showError(err.message || "Okänt fel vid initiering");
  }
};

// ===== SHAKE HANDLER =====
App.prototype.onShake = function() {
  if (document.activeElement) document.activeElement.blur();
  this.switchCurrencies();
};

// ===== HÄMTA VALUTAKURS =====
App.prototype.loadRate = async function() {
  const base = document.getElementById("baseCurrency").value.toUpperCase();
  const target = document.getElementById("targetCurrency").value.toUpperCase();
  if (!base || !target) return;

  try {
    const response = await fetch(`currency_proxy.php?base=${base}&symbols=${target}`);
    const data = await response.json();

    if (!data || !data.rates) throw new Error("Kunde inte hämta kurs");

    const key = Object.keys(data.rates).find(k => k.toUpperCase() === target);
    if (!key) throw new Error("Kurs saknas för vald valuta");

    this.rate = parseFloat(data.rates[key]);

    this.ui.updateCurrencyDropdowns(base, target);
  } catch(err) {
    console.error("Fel vid hämtning av kurs:", err);
    this.ui.showError(err.message || "Okänt fel vid hämtning av kurs");
  }
};

// ===== INIT CONVERTER =====
App.prototype.initConverter = function() {
  const baseInput = document.getElementById("inB");
  const targetInput = document.getElementById("inM");
  if (!baseInput || !targetInput) return;

  function sanitizeNumber(value) {
    value = value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) value = parts[0] + "." + parts.slice(1).join("");
    if (value.startsWith(".")) value = value.substring(1);
    return value;
  }

  baseInput.addEventListener("input", (e) => {
    e.target.value = sanitizeNumber(e.target.value);
    const value = parseFloat(baseInput.value);
    if (isNaN(value) || !this.rate) {
      targetInput.value = "";
      return;
    }
    targetInput.value = (value * this.rate).toFixed(2);
  });

  targetInput.addEventListener("input", (e) => {
    e.target.value = sanitizeNumber(e.target.value);
    const value = parseFloat(targetInput.value);
    if (isNaN(value) || !this.rate) {
      baseInput.value = "";
      return;
    }
    baseInput.value = (value / this.rate).toFixed(2);
  });
};

// ===== SWITCH CURRENCIES =====
App.prototype.switchCurrencies = function() {
  const container = document.getElementById("result");
  container.classList.add("switch-animate");
  setTimeout(() => container.classList.remove("switch-animate"), 300);

  const inB = document.getElementById("inB");
  const inM = document.getElementById("inM");
  const bv = document.getElementById("bv");
  const mv = document.getElementById("mv");
  const baseSelect = document.getElementById("baseCurrency");
  const targetSelect = document.getElementById("targetCurrency");

  [inB.value, inM.value] = [inM.value, inB.value];
  [bv.innerText, mv.innerText] = [mv.innerText, bv.innerText];
  [baseSelect.value, targetSelect.value] = [targetSelect.value, baseSelect.value];

  if (this.rate) this.rate = 1 / this.rate;
};

// ===== SWITCH BUTTON =====
App.prototype.switchBtn = function() {
  const btn = document.getElementById("Switch");
  btn.addEventListener("click", () => this.switchCurrencies());
};