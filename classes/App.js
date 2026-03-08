function App(position){
    if(!position){
        console.error("Ingen position skickades till App");
        return;
    }

    this.position = position;

    this.geoService = new GeoNamesService("fridooow99");
    this.countryApi = new CountryApi();
    this.ui = new UIController("countryInfo","shakeMessageContainer");
    this.motionService = new DeviceMotionService();

    this.country = null;
    this.rate = null;
    this.availableRates = null;

    this.init();
}

App.prototype.init = async function() {
    const self = this;
    console.log("App init start");

    // Start efter användarinteraktion (krävs i vissa browsers)
    document.body.addEventListener("click", function() {
        console.log("User interaction detected - starting motion sensor");
        self.motionService.start(function(strength) {
            console.log("Shake detected strength:", strength);
            self.onShake();
        });
    }, { once: true });

    // Fallback: starta ändå efter 2 sek
    setTimeout(function() {
        if(!self.motionService._isListening) {
            console.log("Fallback start of motion sensor");
            self.motionService.start(function(strength) {
                console.log("Shake detected strength:", strength);
                self.onShake();
            });
        }
    }, 2000);

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
        console.log("Hämtar land med kod...");
        const code = await this.geoService.getCountryCode(
            this.position.latitude,
            this.position.longitude
        );

        const countryData = await this.countryApi.getCountryByCode(code);
        if (!countryData || !countryData[0]) throw new Error("Landdata saknas");
        this.country = countryData[0];
        this.ui.renderCountry(this.country, this.position);

        console.log("Hämtar alla länder...");
        const countries = await this.countryApi.getAllCountries();
        if (!countries || countries.length === 0) throw new Error("Inga länder hämtade");
        console.log("Alla länder hämtade:", countries.length);

        const response = await fetch("currency_proxy.php?base=USD");
        const ratesData = await response.json();
        if (!ratesData || !ratesData.rates) throw new Error("Kunde inte hämta kurser");
        this.availableRates = {};
        Object.keys(ratesData.rates).forEach(k => this.availableRates[k.toUpperCase()] = ratesData.rates[k]);

        this.ui.renderCurrencies(countries, this.country, this, this.availableRates);

    } catch(err) {
        console.error("Fel vid initiering:", err);
    } finally {
        // Ta bort overlay när allt är klart
        const existingOverlay = document.getElementById("loadingOverlayDynamic");
        if (existingOverlay) existingOverlay.remove();
    }

    // Nollställ inputs
    const baseInput = document.getElementById("inB");
    const targetInput = document.getElementById("inM");
    if (baseInput) baseInput.value = "";
    if (targetInput) targetInput.value = "";
};

App.prototype.onShake = function(){
    console.log("Telefonen skakades!");
    this.ui.showShakeMessage("Telefonen skakades!");
};

App.prototype.loadRate = async function(){
    const base = document.getElementById("baseCurrency").value.toUpperCase();
    const target = document.getElementById("targetCurrency").value.toUpperCase();
    if(!base || !target || !this.availableRates) return;

    console.log("loadRate körs. Base:", base, "Target:", target);

    try {
        // Hämta kurs från proxy
        const response = await fetch(`currency_proxy.php?base=${base}&symbols=${target}`);
        const data = await response.json();

        if(!data || !data.rates) throw new Error("Kunde inte hämta kurs");

        // Case-insensitive lookup
        const rateKey = Object.keys(data.rates).find(k => k.toUpperCase() === target);
        if(!rateKey) throw new Error("Kunde inte hämta kurs för " + target);

        this.rate = parseFloat(data.rates[rateKey]);
        console.log("Rate:", this.rate);

        this.ui.updateCurrencyDropdowns(base, target);
        this.initConverter(this.rate);

    } catch(err){
        console.error("Fel vid hämtning av kurs:", err);
    }
};

App.prototype.initConverter = function(rate){
    console.log("initConverter start. Rate:", rate);

    const baseInput = document.getElementById("inB");
    const targetInput = document.getElementById("inM");
    if(!baseInput || !targetInput || !rate) return;

    // Ta bort gamla listeners
    baseInput.replaceWith(baseInput.cloneNode(true));
    targetInput.replaceWith(targetInput.cloneNode(true));

    const newBase = document.getElementById("inB");
    const newTarget = document.getElementById("inM");

    newBase.addEventListener("input", () => {
        const value = parseFloat(newBase.value);
        newTarget.value = isNaN(value) ? "" : (value * rate).toFixed(2);
    });

    newTarget.addEventListener("input", () => {
        const value = parseFloat(newTarget.value);
        newBase.value = isNaN(value) ? "" : (value / rate).toFixed(2);
    });

    // Nollställ värden
    newBase.value = "";
    newTarget.value = "";
};