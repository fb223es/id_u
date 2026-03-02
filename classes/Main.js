function Main() {
    this.gps = GPSService.getInstance();
    this.start();
    console.log("Main startar");
}

Main.prototype.start = function() {
    var self = this;

    this.gps.fetchPosition(function(position, error){
        if(error) { 
            console.log("Fel vid GPS:", error);
            return;
        }

        self.app = new App(position);
    });
};

window.onload = function() {
   new Main();
};