function Main() {
    console.log("Main init");
    this.gps = GPSService.getInstance();
    this.start();
}

Main.prototype.start = function() {
    const self = this;

    // Försök hämta position
    this.gps.fetchPosition(function(position, error) {
        if (position) {
            console.log("Position hämtad:", position);
            self.app = new App(position);
        } else {
            console.log("Fel vid GPS:", error);

            // Skapa synlig knapp om geolocation nekades
            if (!document.getElementById("requestGeoBtn")) {
                const btn = document.createElement("button");
                btn.id = "requestGeoBtn";
                btn.textContent = "Tillåt geolocation";
                Object.assign(btn.style, {
                    position: "fixed",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "15px 25px",
                    fontSize: "18px",
                    backgroundColor: "#3498db",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    zIndex: "10000",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                });

                btn.addEventListener("click", function() {
                    // Försök hämta position igen
                    self.start(); // anropa start igen
                });

                document.body.appendChild(btn);
            }
        }
    });
};

// Initiera när sidan är laddad
window.onload = function() {
    new Main();
};