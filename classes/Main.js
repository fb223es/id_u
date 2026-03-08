var app=null;

function Main(){

console.log("Main start");

this.start();

}

Main.prototype.start=function(){

const self=this;

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(

function(pos){

const position={

latitude:pos.coords.latitude,
longitude:pos.coords.longitude

};

console.log("Position:",position);

app=new App(position);

},

function(){

console.log("GPS nekad");

app=new App(null);

}

);

}else{

console.log("Geolocation saknas");

app=new App(null);

}

};

window.onload=function(){

new Main();

};