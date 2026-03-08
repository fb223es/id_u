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

    this.init();
}

App.prototype.init = async function(){

    const self = this;

    console.log("App init start");

    /* =========================
       STARTA SHAKE SENSOR
       ========================= */

    // Start efter användarinteraktion (krävs i vissa browsers)
    document.body.addEventListener("click", function(){

        console.log("User interaction detected - starting motion sensor");

        self.motionService.start(function(strength){
            console.log("Shake detected strength:", strength);
            self.onShake();
        });

    },{once:true});

    // Fallback: starta ändå efter 2 sek om inget klick sker
    setTimeout(function(){

        if(!self.motionService.callback){

            console.log("Fallback start of motion sensor");

            self.motionService.start(function(strength){
                console.log("Shake detected strength:", strength);
                self.onShake();
            });

        }

    },2000);

    /* =========================
       HÄMTA LAND FRÅN GPS
       ========================= */

    try{

        const code = await this.geoService.getCountryCode(
            this.position.latitude,
            this.position.longitude
        );

        const countryData = await this.countryApi.getCountryByCode(code);

        if(!countryData || !countryData[0]){
            throw new Error("Landdata saknas");
        }

        this.country = countryData[0];

        this.ui.renderCountry(this.country,this.position);

        /* =========================
           HÄMTA ALLA LÄNDER
           ========================= */

        const countries = await this.countryApi.getAllCountries();

        if(!countries || countries.length === 0){
            throw new Error("Inga länder hämtade");
        }

        this.ui.renderCurrencies(countries,this.country,this);

        this.setupDropdownEvents();

    }catch(err){
        console.error("Fel vid initiering:",err);
    }

    /* =========================
       NOLLSTÄLL INPUT
       ========================= */

    const baseInput = document.getElementById("inB");
    const targetInput = document.getElementById("inM");

    if(baseInput) baseInput.value="";
    if(targetInput) targetInput.value="";
};

/* =========================
   SHAKE EVENT
   ========================= */

App.prototype.onShake = function(){

    console.log("Telefonen skakades!");

    this.ui.showShakeMessage("Telefonen skakades!");
};

/* =========================
   DROPDOWN EVENTS
   ========================= */

App.prototype.setupDropdownEvents = function(){

    const baseSelect = document.getElementById("baseCurrency");
    const targetSelect = document.getElementById("targetCurrency");

    if(!baseSelect || !targetSelect) return;

    baseSelect.addEventListener("change", () => {
        this.loadRate();
    });

    targetSelect.addEventListener("change", () => {
        this.loadRate();
    });
};

/* =========================
   HÄMTA VALUTAKURS
   ========================= */

App.prototype.loadRate = async function(){

    const base = document.getElementById("baseCurrency").value;
    const target = document.getElementById("targetCurrency").value;

    if(!base || !target) return;

    try{

        const response = await fetch(
            "currency_proxy.php?base="+base+"&symbols="+target
        );

        const data = await response.json();

        if(!data || !data.rates || !data.rates[target]){
            throw new Error("Kunde inte hämta kurs");
        }

        this.rate = parseFloat(data.rates[target]);

        this.ui.updateCurrencyDropdowns(base,target);

        this.initConverter(this.rate);

    }catch(err){
        console.error("Fel vid hämtning av kurs:",err);
    }
};

/* =========================
   VALUTAOMVANDLARE
   ========================= */

App.prototype.initConverter = function(rate){

    const baseInput = document.getElementById("inB");
    const targetInput = document.getElementById("inM");

    if(!baseInput || !targetInput) return;

    baseInput.value="";
    targetInput.value="";

    baseInput.oninput = () => {

        const value = parseFloat(baseInput.value);

        targetInput.value = isNaN(value) ? "" : (value * rate).toFixed(2);
    };

    targetInput.oninput = () => {

        const value = parseFloat(targetInput.value);

        baseInput.value = isNaN(value) ? "" : (value / rate).toFixed(2);
    };
};