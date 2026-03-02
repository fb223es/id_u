// App.js
function App(position) {
    this.position = position;
    console.log("App startar");

    this.geoService = new GeoNamesService("fridooow99");
    this.countryApi = new CountryApi();
    this.ui = new UIController("countryInfo");
    this.motionService = new DeviceMotionService(); // 🔥 DEN SAKNADES
    this.country = null;

    this.init();
}

// Prototypmetod
App.prototype.init = function() {
    var self = this;
    console.log("App init");

    // 🔥 Nu finns motionService
    this.motionService.start(function (strength) {
        console.log("Telefonen skakades!", strength);
        self.onShake();
    }, 35);

    this.geoService.getCountryCode(
        this.position.latitude,
        this.position.longitude
    )
    .then(function(code){
        return self.countryApi.getCountryByCode(code);
    })
    .then(function(data){
        self.country = data[0];
        self.ui.renderCountry(self.country, self.position);
    })
    .catch(function(err){
        console.log("Fel vid hämtning:", err);
    });
};

App.prototype.onShake = function () {
    this.ui.showShakeMessage("Du skakade telefonen!");
};