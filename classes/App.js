// ===== HUVUDKLASS FÖR APPEN =====
function App(position) {
    if (!position) {
        console.error("Ingen position skickades till App");
        return;
    }

    this.position = position;
    this.geoService = new GeoNamesService("fridooow99");
    this.countryApi = new CountryApi();
    this.currencyApi = new CurrencyApi();
    this.ui = new UIController("countryInfo","shakeMessageContainer");
    this.motionService = new DeviceMotionService();

    this.country = null; // användarens land
    this.rate = null;    // aktuell kurs

    this.init();
}

// ===== INITIERA APP =====
App.prototype.init = async function() {
    this.motionService.start(strength => this.onShake(), 35);

    try {
        const code = await this.geoService.getCountryCode(this.position.latitude, this.position.longitude);
        const countryData = await this.countryApi.getCountryByCode(code);
        this.country = countryData[0];

        // Visa land + flagga
        this.ui.renderCountry(this.country, this.position);

        // Hämta alla länder för valutalistor
        const countries = await this.countryApi.getAllCountries();
        this.ui.renderCurrencies(countries, this.country);

    } catch (err) {
        console.error("Fel vid initiering av appen:", err);
    }
};

// ===== HÄMTA VALUTAKURS =====
App.prototype.loadRate = async function() {
    const base = document.getElementById("baseCurrency").value;
    const target = document.getElementById("targetCurrency").value;
    if (!base || !target) return;

    try {
        const response = await fetch(`currency_proxy.php?base=${base}&symbols=${target}`);
        const data = await response.json();
        if (!data || !data.rates || !data.rates[target]) throw new Error("Kunde inte hämta kurs för " + target);

        this.rate = data.rates[target];

        // Uppdatera bv och mv i UI
        this.ui.updateCurrencyDropdowns(base, target);

        // Starta converter
        this.initConverter(this.rate);

    } catch (err) {
        console.error("Fel vid hämtning av kurs:", err);
    }
};

// ===== SKAKA-FUNKTION =====
App.prototype.onShake = function() {
    this.ui.showShakeMessage("Telefonen skakades!");
};

// ===== VALUTAOMVANDLARE =====
App.prototype.initConverter = function(rate) {
    const baseInput = document.getElementById("inB");
    const targetInput = document.getElementById("inM");
    if (!baseInput || !targetInput) return;

    baseInput.oninput = () => {
        const value = parseFloat(baseInput.value);
        targetInput.value = isNaN(value) ? "" : (value * rate).toFixed(2);
    };

    targetInput.oninput = () => {
        const value = parseFloat(targetInput.value);
        baseInput.value = isNaN(value) ? "" : (value / rate).toFixed(2);
    };
};