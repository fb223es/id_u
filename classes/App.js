// ===== HUVUDKLASS FÖR APPEN =====
function App(position) {
  this.position = position || null;

  this.geoService = new GeoNamesService("fridooow99");
  this.countryApi = new CountryApi();
  this.ui = new UIController("countryInfo", "shakeMessageContainer");
  this.motionService = new DeviceMotionService();

  this.country = null;
  this.rate = null;
  this.availableRates = null;

  // Visa meddelande om position saknas
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

// ===== INITIERING =====
App.prototype.init = async function () {
  const self = this;

  console.log("App init start");

  // Starta switch-knappen
  this.switchBtn();

  // Initiera converter
  this.initConverter();

  // Starta motion sensor vid första interaktion (browserkrav)
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

    // Hämta landkod endast om position finns
    if (this.position) {
      console.log("Hämtar landkod...");
      code = await this.geoService.getCountryCode(
        this.position.latitude,
        this.position.longitude
      );
    }

    let countryData = [];
    if (code) {
      countryData = await this.countryApi.getCountryByCode(code);
      if (countryData && countryData[0]) {
        this.country = countryData[0];
        this.ui.renderCountry(this.country, this.position);
      }
    }

    console.log("Hämtar alla länder...");
    const countries = await this.countryApi.getAllCountries();
    if (!countries || countries.length === 0)
      throw new Error("Inga länder hämtade");

    // Hämta valutakurser (default base USD)
    const response = await fetch("currency_proxy.php?base=USD");
    const ratesData = await response.json();
    if (!ratesData || !ratesData.rates) throw new Error("Kunde inte hämta kurser");

    this.availableRates = {};
    Object.keys(ratesData.rates).forEach((k) => {
      this.availableRates[k.toUpperCase()] = parseFloat(ratesData.rates[k]);
    });

    this.ui.renderCurrencies(countries, this.country, this, this.availableRates);
  } catch (err) {
    console.error("Fel vid initiering:", err);
  }
};

// ===== SKAK-FUNKTION =====
App.prototype.onShake = function () {
  console.log("Telefonen skakades");
  if (document.activeElement) document.activeElement.blur();
  this.switchCurrencies();
};

// ===== HÄMTA VÄXLINGSKURS =====
App.prototype.loadRate = async function () {
  const base = document.getElementById("baseCurrency").value.toUpperCase();
  const target = document.getElementById("targetCurrency").value.toUpperCase();
  if (!base || !target) return;

  try {
    const response = await fetch(
      `currency_proxy.php?base=${base}&symbols=${target}`
    );
    const data = await response.json();
    if (!data || !data.rates) throw new Error("Kunde inte hämta kurs");

    const key = Object.keys(data.rates).find((k) => k.toUpperCase() === target);
    if (!key) throw new Error("Kurs saknas");

    this.rate = parseFloat(data.rates[key]);
    console.log("Rate:", this.rate);

    this.ui.updateCurrencyDropdowns(base, target);
  } catch (err) {
    console.error("Fel vid hämtning av kurs:", err);
  }
};

// ===== VALUTAOMVANDLARE =====
App.prototype.initConverter = function () {
  const baseInput = document.getElementById("inB");
  const targetInput = document.getElementById("inM");

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
    targetInput.value = isNaN(value) || !this.rate ? "" : (value * this.rate).toFixed(2);
  });

  targetInput.addEventListener("input", (e) => {
    e.target.value = sanitizeNumber(e.target.value);
    const value = parseFloat(targetInput.value);
    baseInput.value = isNaN(value) || !this.rate ? "" : (value / this.rate).toFixed(2);
  });
};

// ===== BYTA VALUTOR =====
App.prototype.switchCurrencies = function () {
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

// ===== SWITCH KNAPP =====
App.prototype.switchBtn = function () {
  const btn = document.getElementById("Switch");
  btn.addEventListener("click", () => this.switchCurrencies());
};