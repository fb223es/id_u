function UIController(outputElementId, containerId) {
  this.outputElementId = outputElementId || "countryInfo";
  this.container = document.getElementById(containerId);
  this.currencies = {};
}

// ===== VISA LAND OCH FLAGGA =====
UIController.prototype.renderCountry = function(country, position) {
  const output = document.getElementById(this.outputElementId);
  if (!output) return;
  output.innerHTML = "";

  if (!country) return;

  const container = document.createElement("div");
  const title = document.createElement("h3");
  title.innerText = country.name.common;
  const flag = document.createElement("img");
  flag.src = country.flags.png;
  flag.alt = country.name.common + " flag";

  container.appendChild(title);
  container.appendChild(flag);

  if (position && position.latitude != null && position.longitude != null) {
    const coords = document.createElement("p");
    coords.innerText = "Lat: " + position.latitude.toFixed(4) + 
                       ", Lng: " + position.longitude.toFixed(4);
    container.appendChild(coords);
  }

  output.appendChild(container);
};

// ===== VISA FEL =====
UIController.prototype.showError = function(message) {
  const container = document.getElementById("errorMessage");
  if (!container) return;
  container.innerHTML = ""; // töm tidigare fel
  const p = document.createElement("p");
  p.style.color = "red";
  p.style.fontWeight = "bold";
  p.innerText = message;
  container.appendChild(p);
};

// ===== DROPDOWN VALUTOR =====
UIController.prototype.renderCurrencies = function(countries, userCountry, app, rates) {
  const baseSelect = document.getElementById("baseCurrency");
  const targetSelect = document.getElementById("targetCurrency");
  if (!baseSelect || !targetSelect) return;

  baseSelect.innerHTML = "";
  targetSelect.innerHTML = "";
  this.currencies = {};

  countries.forEach(country => {
    if (!country.currencies) return;
    for (let code in country.currencies) {
      if (!this.currencies[code]) {
        this.currencies[code] = country.currencies[code].name;
      }
    }
  });

  const codes = Object.keys(this.currencies).sort();
  codes.forEach(code => {
    const optionBase = document.createElement("option");
    optionBase.value = code;
    optionBase.textContent = code + " - " + this.currencies[code];

    const optionTarget = optionBase.cloneNode(true);

    baseSelect.appendChild(optionBase);
    targetSelect.appendChild(optionTarget);
  });

  if (userCountry && userCountry.currencies) {
    const userCurrency = Object.keys(userCountry.currencies)[0];
    baseSelect.value = userCurrency;
    const bv = document.getElementById("bv");
    if (bv) bv.innerText = userCurrency + " - " + this.currencies[userCurrency];
  }

  targetSelect.addEventListener("change", function() {
    const mv = document.getElementById("mv");
    if (mv && this.currencies[targetSelect.value]) {
      mv.innerText = targetSelect.value + " - " + this.currencies[targetSelect.value];
    }
  }.bind(this));
};

UIController.prototype.updateCurrencyDropdowns = function(base, target) {
  const baseSelect = document.getElementById("baseCurrency");
  const targetSelect = document.getElementById("targetCurrency");

  if (baseSelect && targetSelect && this.currencies) {
    baseSelect.value = base;
    targetSelect.value = target;

    const bv = document.getElementById("bv");
    const mv = document.getElementById("mv");
    if (bv) bv.innerText = base + " - " + this.currencies[base];
    if (mv) mv.innerText = target + " - " + this.currencies[target];
  }
};