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



App.prototype.init = async function(){

    const self = this;

    console.log("App init start");

    // start switch-knapp
    this.switchBtn();

    // start converter
    this.initConverter();


    // start motion efter första klick (browserkrav)
    document.body.addEventListener("click", function(){

        console.log("User interaction detected - starting motion sensor");

        self.motionService.start(function(strength){

            console.log("Shake detected strength:", strength);

            self.onShake();

        });

    }, { once:true });



    try{

        console.log("Hämtar land...");

        const code = await this.geoService.getCountryCode(
            this.position.latitude,
            this.position.longitude
        );


        const countryData = await this.countryApi.getCountryByCode(code);

        if(!countryData || !countryData[0])
            throw new Error("Landdata saknas");


        this.country = countryData[0];

        this.ui.renderCountry(this.country, this.position);



        console.log("Hämtar alla länder...");

        const countries = await this.countryApi.getAllCountries();

        if(!countries || countries.length === 0)
            throw new Error("Inga länder hämtade");



        const response = await fetch("currency_proxy.php?base=USD");

        const ratesData = await response.json();

        if(!ratesData || !ratesData.rates)
            throw new Error("Kunde inte hämta kurser");


        this.availableRates = {};

        Object.keys(ratesData.rates).forEach(k=>{
            this.availableRates[k.toUpperCase()] = parseFloat(ratesData.rates[k]);
        });



        this.ui.renderCurrencies(
            countries,
            this.country,
            this,
            this.availableRates
        );


    }
    catch(err){

        console.error("Fel vid initiering:", err);

    }

};




App.prototype.onShake = function(){

    console.log("Telefonen skakades");

    this.switchCurrencies();

};




App.prototype.loadRate = async function(){

    const base = document.getElementById("baseCurrency").value.toUpperCase();
    const target = document.getElementById("targetCurrency").value.toUpperCase();

    if(!base || !target) return;

    console.log("loadRate:", base, target);


    try{

        const response = await fetch(
            `currency_proxy.php?base=${base}&symbols=${target}`
        );

        const data = await response.json();

        if(!data || !data.rates)
            throw new Error("Kunde inte hämta kurs");


        const key = Object.keys(data.rates)
            .find(k => k.toUpperCase() === target);

        if(!key)
            throw new Error("Kurs saknas");


        this.rate = parseFloat(data.rates[key]);

        console.log("Rate:", this.rate);


        this.ui.updateCurrencyDropdowns(base, target);


    }
    catch(err){

        console.error("Fel vid hämtning av kurs:", err);

    }

};





App.prototype.initConverter = function(){

    const baseInput = document.getElementById("inB");
    const targetInput = document.getElementById("inM");


    baseInput.addEventListener("input", ()=>{

        const value = parseFloat(baseInput.value);

        if(isNaN(value) || !this.rate){
            targetInput.value="";
            return;
        }

        targetInput.value = (value * this.rate).toFixed(2);

    });



    targetInput.addEventListener("input", ()=>{

        const value = parseFloat(targetInput.value);

        if(isNaN(value) || !this.rate){
            baseInput.value="";
            return;
        }

        baseInput.value = (value / this.rate).toFixed(2);

    });

};





App.prototype.switchCurrencies = function(){

    const inB = document.getElementById("inB");
    const inM = document.getElementById("inM");

    const bv = document.getElementById("bv");
    const mv = document.getElementById("mv");

    const baseSelect = document.getElementById("baseCurrency");
    const targetSelect = document.getElementById("targetCurrency");


    // byt input
    [inB.value, inM.value] = [inM.value, inB.value];

    // byt text
    [bv.innerText, mv.innerText] = [mv.innerText, bv.innerText];

    // byt dropdown
    [baseSelect.value, targetSelect.value] =
    [targetSelect.value, baseSelect.value];


    // invertera kurs
    if(this.rate){
        this.rate = 1 / this.rate;
    }

};





App.prototype.switchBtn = function(){

    const btn = document.getElementById("Switch");

    btn.addEventListener("click", ()=>{

        this.switchCurrencies();

    });

};