// App.js
function App(position) {
  this.position = position;
  console.log("App startar");

  this.geoService = new GeoNamesService("fridooow99");
  this.countryApi = new CountryApi();
  this.currencyApi = new CurrencyApi();
  this.ui = new UIController("countryInfo", "shakeMessageContainer");
  this.motionService = new DeviceMotionService();

  this.country = null;
  this.allCountries = null;
  this.currentRate = null;

  this.init();
}

// INIT
App.prototype.init = async function() {
  console.log("App init");

  // Starta shake detection
  this.motionService.start((strength) => {
    console.log("Telefonen skakades!", strength);
    this.onShake();
  }, 35);

  // --- Skapa overlay spinner ---
  const overlay = document.createElement("div");
  overlay.id = "loadingOverlayDynamic";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "9999",
  });

  const spinner = document.createElement("div");
  Object.assign(spinner.style, {
    border: "8px solid #f3f3f3",
    borderTop: "8px solid #3498db",
    borderRadius: "50%",
    width: "80px",
    height: "80px",
    animation: "spin 1s linear infinite",
  });

  overlay.appendChild(spinner);
  document.body.appendChild(overlay);

  // CSS keyframes
  if (!document.getElementById("spinnerKeyframes")) {
    const style = document.createElement("style");
    style.id = "spinnerKeyframes";
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  try {
    // --- Hämta landkod ---
    const code = await this.geoService.getCountryCode(this.position.latitude, this.position.longitude);
    console.log("Landkod:", code);

    // --- Hämta landdata ---
    const data = await this.countryApi.getCountryByCode(code);
    if (!data || !data[0]) throw new Error("Landdata saknas");
    this.country = data[0];
    console.log("Användarens land:", this.country.name.common);
    this.ui.renderCountry(this.country, this.position);

    // --- Hämta alla länder ---
    const countries = await this.countryApi.getAllCountries();
    if (!countries || countries.length === 0) throw new Error("Inga länder hämtade");
    this.allCountries = countries;
    this.ui.renderCurrencies(countries, this.country);

    // --- Hämta växlingskurser via PHP-proxy ---
    const baseCurrency = Object.keys(this.country.currencies)[0]; // t.ex. SEK
    const symbols = "USD,EUR,GBP"; // ex. valutor
    const rateDataRes = await fetch(`currency_proxy.php?base=${baseCurrency}&symbols=${symbols}`);
    const rateData = await rateDataRes.json();
    if (!rateData || rateData.error) throw new Error(rateData.error || "Fel vid fetch av kurser");

    console.log("Kurser för basvaluta:", rateData.rates);

    // --- Rendera målvaluta dropdown ---
    const targetSelect = document.getElementById("targetCurrency");
    targetSelect.innerHTML = "<option disabled selected>-- Välj valuta --</option>";
    Object.keys(rateData.rates).forEach((code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = code;
      targetSelect.appendChild(opt);
    });

    // Initiera converter med första valuta
    const firstTarget = Object.keys(rateData.rates)[0];
    if (firstTarget) {
      this.currentRate = rateData.rates[firstTarget];
      this.initConverter(this.currentRate);
    }

    console.log("ALLA FETCHES KLARA");

  } catch (err) {
    console.error("Fel vid initiering av appen:", err);
  } finally {
    // ✅ Ta bort overlay helt från DOM
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }
}

// SHAKE EVENT
App.prototype.onShake = function() {
  this.ui.showShakeMessage("Du skakade telefonen!");
}

// VALUTAOMVANDLARE
App.prototype.initConverter = function(rate) {
  const baseInput = document.getElementById("inB");
  const targetInput = document.getElementById("inM");

  if (!baseInput || !targetInput) {
    console.log("Inputfält saknas");
    return;
  }

  // Ta bort gamla listeners
  const newBase = baseInput.cloneNode();
  const newTarget = targetInput.cloneNode();
  baseInput.replaceWith(newBase);
  targetInput.replaceWith(newTarget);

  newBase.addEventListener("input", () => {
    const value = parseFloat(newBase.value);
    newTarget.value = isNaN(value) ? "" : (value * rate).toFixed(2);
  });

  newTarget.addEventListener("input", () => {
    const value = parseFloat(newTarget.value);
    newBase.value = isNaN(value) ? "" : (value / rate).toFixed(2);
  });
};