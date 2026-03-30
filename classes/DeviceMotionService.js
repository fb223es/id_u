/**
 * Service för att lyssna på enhetens rörelsesensor och upptäcka skakningar.
 * Implementerad som singleton utan IIFE.
 */
class DeviceMotionService {
  constructor() {
    /** @type {number} */
    this.threshold = 18;
    /** @type {number} */
    this.lastTime = 0;
    /** @type {number} */
    this.lastX = 0;
    /** @type {number} */
    this.lastY = 0;
    /** @type {number} */
    this.lastZ = 0;
    /** @type {?function(number)} */
    this.callback = null;
  }

  /** @type {?DeviceMotionService} */
  static instance = null;

  /**
   * Returnerar singleton-instansen.
   * @return {!DeviceMotionService}
   */
  static getInstance() {
    if (!DeviceMotionService.instance) {
      DeviceMotionService.instance = new DeviceMotionService();
    }
    return DeviceMotionService.instance;
  }

  /**
   * Startar lyssning på devicemotion-event.
   * @param {function(number)} callback
   */
  start(callback) {
    this.callback = callback;
    const self = this;

    /**
     * @param {!Event} e
     */
    const handler = function(e) {
      const event = /** @type {!DeviceMotionEvent} */ (e);
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x != null ? acc.x : 0;
      const y = acc.y != null ? acc.y : 0;
      const z = acc.z != null ? acc.z : 0;

      if (self.lastTime === 0) {
        self.lastX = x; self.lastY = y; self.lastZ = z;
        self.lastTime = Date.now();
        return;
      }

      const delta = Math.abs(x - self.lastX) +
                    Math.abs(y - self.lastY) +
                    Math.abs(z - self.lastZ);

      if (delta > self.threshold) {
        const now = Date.now();
        if (now - self.lastTime > 1200) {
          self.lastTime = now;
          if (self.callback) self.callback(delta);
        }
      }

      self.lastX = x; self.lastY = y; self.lastZ = z;
    };

    window.addEventListener("devicemotion", handler);
  }
}