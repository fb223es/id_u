// UIController.js
function UIController(outputElementId, containerId) {
    this.outputElementId = outputElementId || "countryInfo";
    this.container = document.getElementById(containerId);
}

// Rendera landet och flagga
UIController.prototype.renderCountry = function(country, position) {
    var output = document.getElementById(this.outputElementId);
    if (!output) { console.error("Elementet #" + this.outputElementId + " finns inte i DOM"); return; }

    output.innerHTML = "";

    var container = document.createElement("div");
    container.className = "country-container";

    var h3 = document.createElement("h3");
    h3.innerText = country.name.common;

    var img = document.createElement("img");
    img.src = country.flags.png;
    img.alt = country.name.common + " flag";

    container.appendChild(h3);
    container.appendChild(img);

    if (position) {
        var coords = document.createElement("p");
        coords.className = "coords";
        coords.innerText = "Lat: " + position.latitude.toFixed(4) + ", Lng: " + position.longitude.toFixed(4);
        container.appendChild(coords);
    }

    output.appendChild(container);
    console.log("UIController: Land renderat i DOM:", country.name.common);
};

// Visa meddelande när telefonen skakas
UIController.prototype.showShakeMessage = function (text) {
    if (!this.container) {
        console.warn("shakeMessage container finns inte i DOM");
        return;
    }

    this.container.innerHTML = "";

    var msg = document.createElement("p");
    msg.textContent = text;
    msg.className = "shake-message";

    this.container.appendChild(msg);
};

// Rendera alla valutor i dropdowns
UIController.prototype.renderCurrencies = function (countries, userCountry) {
    var baseSelect = document.getElementById("baseCurrency");
    var targetSelect = document.getElementById("targetCurrency");

    if (!baseSelect || !targetSelect) {
        console.error("Dropdown saknas i DOM");
        return;
    }

    baseSelect.innerHTML = "";
    targetSelect.innerHTML = "";

    // Samla alla unika valutor
    var currencies = {};
    countries.forEach(function(country) {
        if (!country.currencies) return;
        for (var code in country.currencies) {
            if (!currencies[code]) {
                currencies[code] = country.currencies[code].name;
            }
        }
    });

    // Sortera valutor alfabetiskt
    var sortedCodes = Object.keys(currencies).sort();

    // Placeholder för target
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Välj valuta --";
    placeholder.disabled = true;
    placeholder.selected = true;
    targetSelect.appendChild(placeholder);

    // Skapa options för base och target
    sortedCodes.forEach(function(code) {
        var optionBase = document.createElement("option");
        optionBase.value = code;
        optionBase.textContent = code + " - " + currencies[code];

        var optionTarget = optionBase.cloneNode(true);

        baseSelect.appendChild(optionBase);
        targetSelect.appendChild(optionTarget);
    });

    // Sätt basvaluta till användarens land
    if (userCountry && userCountry.currencies) {
        var userCurrency = Object.keys(userCountry.currencies)[0];
        baseSelect.value = userCurrency;
    }
};