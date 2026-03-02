(function (global) {
    function DeviceMotionService() {
        if (DeviceMotionService._instance) {
            return DeviceMotionService._instance;
        }

        this.threshold = 30;
        this._isListening = false;
        this._callback = null;

        DeviceMotionService._instance = this;
    }

    DeviceMotionService.prototype.start = function (callback, threshold) {
        if (this._isListening) return;

        this.threshold = threshold || this.threshold;
        this._callback = callback;

        var self = this;

        function handleMotion(event) {
            var acc = event.accelerationIncludingGravity;
            if (!acc) return;

            var total =
                Math.abs(acc.x) +
                Math.abs(acc.y) +
                Math.abs(acc.z);

            if (total > self.threshold) {
                if (self._callback) {
                    self._callback(total);
                }
            }
        }

        // iOS permission
        if (typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function") {

            DeviceMotionEvent.requestPermission()
                .then(function (permissionState) {
                    if (permissionState === "granted") {
                        window.addEventListener("devicemotion", handleMotion);
                    }
                })
                .catch(console.error);

        } else {
            window.addEventListener("devicemotion", handleMotion);
        }

        this._isListening = true;
    };

    DeviceMotionService.prototype.stop = function () {
        window.removeEventListener("devicemotion", this.handleMotion);
        this._isListening = false;
    };

    // Exponera globalt (viktigt i ES5)
    global.DeviceMotionService = DeviceMotionService;

})(window);