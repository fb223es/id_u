// UIController.js
function UIController(outputElementId, containerId) {
    this.outputElementId = outputElementId || "countryInfo";
    this.container = document.getElementById(containerId);
}

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

UIController.prototype.showShakeMessage = function (text) {
    var msg = document.createElement("p");
    msg.textContent = text;
    msg.className = "shake-message";

    this.container.appendChild(msg);
};