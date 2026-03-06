(function(global) {
    function DeviceMotionService() {
        // Singleton
        if (DeviceMotionService._instance) return DeviceMotionService._instance;

        this.threshold = 30;       // standard tröskel
        this._isListening = false;
        this._callback = null;
        this._lastX = null;
        this._lastY = null;
        this._lastZ = null;
        this._handleMotion = null;
        this._firstEvent = false;

        DeviceMotionService._instance = this;
    }

    DeviceMotionService.prototype.start = function(callback, threshold) {
        if (this._isListening) return;

        this.threshold = threshold || this.threshold;
        this._callback = callback;
        var self = this;
        this._firstEvent = false;

        console.log("DeviceMotion startar...");

        this._handleMotion = function(event) {
            var a = event.accelerationIncludingGravity || event.acceleration;

            // fallback om null (DevTools / dator)
            if (!a) a = {x:0, y:0, z:0};
            if (a.x === null) a.x = 0;
            if (a.y === null) a.y = 0;
            if (a.z === null) a.z = 0;

            // Ignorera första eventet, sätt lastX/Y/Z
            if (!self._firstEvent) {
                self._lastX = a.x;
                self._lastY = a.y;
                self._lastZ = a.z;
                self._firstEvent = true;
                return; // vänta på nästa event
            }

            var delta = Math.abs(a.x - self._lastX) +
                        Math.abs(a.y - self._lastY) +
                        Math.abs(a.z - self._lastZ);

            if (delta > self.threshold && self._callback) {
                self._callback(delta);
            }

            // Uppdatera senaste värden
            self._lastX = a.x;
            self._lastY = a.y;
            self._lastZ = a.z;

            console.log("Acceleration:", a.x.toFixed(2), a.y.toFixed(2), a.z.toFixed(2), "Delta:", delta.toFixed(2));
        };

        // iOS 13+ permission
        if (typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function") {

            DeviceMotionEvent.requestPermission()
                .then(function(permissionState) {
                    if (permissionState === "granted") {
                        window.addEventListener("devicemotion", self._handleMotion);
                    } else {
                        console.warn("DeviceMotion permission nekad");
                    }
                })
                .catch(console.error);

        } else {
            window.addEventListener("devicemotion", self._handleMotion);
        }

        this._isListening = true;
    };

    DeviceMotionService.prototype.stop = function() {
        if (this._handleMotion) {
            window.removeEventListener("devicemotion", this._handleMotion);
            this._isListening = false;
            console.log("DeviceMotion stoppad");
        }
    };

    // Fungerar även för test på dator med knapptryck (valfritt)
    DeviceMotionService.prototype.simulateShake = function(strength) {
        if (this._callback) this._callback(strength || 50);
    };

    // Singleton exponeras globalt
    global.DeviceMotionService = DeviceMotionService;

})(window);