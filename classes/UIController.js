// ===== UI CONTROLLER =====
function UIController(outputElementId, containerId) {
    this.outputElementId = outputElementId || "countryInfo";
    this.container = document.getElementById(containerId);
    this.currencies = {}; // objekt med alla valutor
}

// ===== VISA LAND OCH FLAGGA =====
UIController.prototype.renderCountry = function(country, position) {
    const output = document.getElementById(this.outputElementId);
    if (!output) return;

    output.innerHTML = "";

    const container = document.createElement("div");
    const title = document.createElement("h3");
    title.innerText = country.name.common;
    const flag = document.createElement("img");
    flag.src = country.flags.png;
    flag.alt = country.name.common + " flag";

    container.appendChild(title);
    container.appendChild(flag);

    // Visa koordinater om de finns
    if (position) {
        const coords = document.createElement("p");
        coords.innerText = "Lat: " + position.latitude.toFixed(4) +
                           ", Lng: " + position.longitude.toFixed(4);
        container.appendChild(coords);
    }

    output.appendChild(container);
};

// ===== VISA SHAKE-MEDDELANDE =====
UIController.prototype.showShakeMessage = function(text) {
    if (!this.container) return;
    this.container.innerHTML = "";
    const msg = document.createElement("p");
    msg.innerText = text;
    this.container.appendChild(msg);
};

// ===== SKAPA VALUTADROPDOWNS =====
UIController.prototype.renderCurrencies = function(countries, userCountry) {
    const baseSelect = document.getElementById("baseCurrency");
    const targetSelect = document.getElementById("targetCurrency");
    if (!baseSelect || !targetSelect) return;

    baseSelect.innerHTML = "";
    targetSelect.innerHTML = "";

    // Skapa objekt med alla unika valutor
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

    // Lägg in placeholder för målvaluta
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Välj valuta --";
    placeholder.disabled = true;
    placeholder.selected = true;
    targetSelect.appendChild(placeholder);

    // Skapa options
    codes.forEach(code => {
        const optionBase = document.createElement("option");
        optionBase.value = code;
        optionBase.textContent = code + " - " + this.currencies[code];

        const optionTarget = optionBase.cloneNode(true);

        baseSelect.appendChild(optionBase);
        targetSelect.appendChild(optionTarget);
    });

    // Sätt användarens valuta som bas
    let userCurrency = null;
    if (userCountry && userCountry.currencies) {
        userCurrency = Object.keys(userCountry.currencies)[0];
        baseSelect.value = userCurrency;
    }

    // Visa basvaluta
    const bv = document.getElementById("bv");
    if (bv && userCurrency) bv.innerText = userCurrency + " - " + this.currencies[userCurrency];

    // Event: när målvalutan ändras
    targetSelect.addEventListener("change", () => {
        const mv = document.getElementById("mv");
        if (mv) mv.innerText = targetSelect.value + " - " + this.currencies[targetSelect.value];
    });

    // **NY LYSSNARE: När basvalutan ändras**
    baseSelect.addEventListener("change", () => {
        if (bv) bv.innerText = baseSelect.value + " - " + this.currencies[baseSelect.value];
        // Om du vill kan du även hämta ny kurs via App.loadRate() från Main.js
    });
};

// ===== UPPDATERA DROPDOWNS VID NY KURS =====
UIController.prototype.updateCurrencyDropdowns = function(base, target) {
    const baseSelect = document.getElementById("baseCurrency");
    const targetSelect = document.getElementById("targetCurrency");

    if (baseSelect && targetSelect && this.currencies) {
        baseSelect.value = base;
        targetSelect.value = target;

        // Uppdatera bv och mv
        const bv = document.getElementById("bv");
        const mv = document.getElementById("mv");
        if (bv) bv.innerText = base + " - " + this.currencies[base];
        if (mv) mv.innerText = target + " - " + this.currencies[target];
    }
};