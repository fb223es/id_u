// App.js
function App(position) {
  this.position = position;
  console.log("App startar");

  this.geoService = new GeoNamesService("fridooow99");
  this.countryApi = new CountryApi();
  this.ui = new UIController("countryInfo", "shakeMessageContainer");
  this.motionService = new DeviceMotionService();

  this.country = null;
  this.allCountries = null;
  this.currentRate = null;

  this.init();
}

// INIT
App.prototype.init = function() {
  const self = this;
  console.log("App init");

  // Starta shake detection
  this.motionService.start(function(strength) {
    console.log("Telefonen skakades!", strength);
    self.onShake();
  }, 35);

  // Skapa overlay spinner
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

  // Lägg till CSS keyframes för spinner om det inte finns
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

  // --- Börja hämta land och data ---
  this.geoService.getCountryCode(this.position.latitude, this.position.longitude)
    .then(function(code) {
      console.log("Landkod:", code);
      return self.countryApi.getCountryByCode(code);
    })
    .then(function(data) {
      if (!data || !data[0]) throw new Error("Landdata saknas");
      self.country = data[0];
      console.log("Användarens land:", self.country.name.common);
      self.ui.renderCountry(self.country, self.position);

      return self.countryApi.getAllCountries();
    })
    .then(function(countries) {
      if (!countries || countries.length === 0) throw new Error("Inga länder hämtade");
      console.log("Alla länder hämtade:", countries.length);
      self.allCountries = countries;

      // --- Skapa valuta dropdowns med gemensam lista ---
      const currencyMap = {};
      countries.forEach(country => {
        if (!country.currencies) return;
        Object.keys(country.currencies).forEach(code => {
          if (!currencyMap[code])
            currencyMap[code] = country.currencies[code].name;
        });
      });

      // Bygg listan "KOD - Namn"
      const options = Object.keys(currencyMap).map(code => `${code} - ${currencyMap[code]}`);

      // Basvaluta och målvaluta
      const baseSelect = document.getElementById("baseCurrency");
      const targetSelect = document.getElementById("targetCurrency");

      baseSelect.innerHTML = "<option disabled selected>-- Välj valuta --</option>";
      targetSelect.innerHTML = "<option disabled selected>-- Välj valuta --</option>";

      options.forEach(optText => {
        const code = optText.split(" - ")[0];
        const baseOption = document.createElement("option");
        baseOption.value = code;
        baseOption.textContent = optText;
        baseSelect.appendChild(baseOption);

        const targetOption = document.createElement("option");
        targetOption.value = code;
        targetOption.textContent = optText;
        targetSelect.appendChild(targetOption);
      });

      // Sätt användarens land som standard
      const userBase = Object.keys(self.country.currencies)[0];
      baseSelect.value = userBase;
      targetSelect.value = userBase;

      // --- Hämta växlingskurser via PHP-proxy ---
      return fetch(`currency_proxy.php?base=${userBase}`)
        .then(res => res.json())
        .then(data => {
          if (!data || data.error) throw new Error(data.error || "Fel vid fetch av kurser");
          return data;
        });
    })
    .then(function(rateData) {
      console.log("Kurser för basvaluta:", rateData.rates);

      const firstTarget = Object.keys(rateData.rates)[0];
      if (firstTarget) {
        self.currentRate = rateData.rates[firstTarget];
        self.initConverter(self.currentRate);
      }

      // ✅ Ta bort overlay helt
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    })
    .catch(function(err) {
      console.error("Fel vid initiering av appen:", err);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
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

  newBase.addEventListener("input", function() {
    const value = parseFloat(newBase.value);
    newTarget.value = isNaN(value) ? "" : (value * rate).toFixed(2);
  });

  newTarget.addEventListener("input", function() {
    const value = parseFloat(newTarget.value);
    newBase.value = isNaN(value) ? "" : (value / rate).toFixed(2);
  });
};