(function(global){

function DeviceMotionService(){

if(DeviceMotionService.instance){
return DeviceMotionService.instance;
}

this.threshold = 18;
this.lastTime = 0;

this.lastX=null;
this.lastY=null;
this.lastZ=null;

this.callback=null;

DeviceMotionService.instance=this;
}

DeviceMotionService.prototype.start=function(callback){

this.callback=callback;

const self=this;

console.log("DeviceMotion start");

window.addEventListener("devicemotion",function(event){

const acc=event.accelerationIncludingGravity;

if(!acc){
console.log("Ingen sensor data");
return;
}

const x=acc.x||0;
const y=acc.y||0;
const z=acc.z||0;

if(self.lastX===null){

self.lastX=x;
self.lastY=y;
self.lastZ=z;

return;
}

const delta=
Math.abs(x-self.lastX)+
Math.abs(y-self.lastY)+
Math.abs(z-self.lastZ);

console.log("delta:",delta);

if(delta>self.threshold){

const now=Date.now();

if(now-self.lastTime>1200){

self.lastTime=now;

console.log("SHAKE DETECTED");

if(self.callback){
self.callback(delta);
}

}
}

self.lastX=x;
self.lastY=y;
self.lastZ=z;

});

};

DeviceMotionService.prototype.simulateShake=function(){

if(this.callback){
this.callback(50);
}

};

global.DeviceMotionService=DeviceMotionService;

})(window);