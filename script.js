const apiKey = "739098adcbab3596715447d628e4e1c9";

// UI
const city = document.getElementById("city");
const temp = document.getElementById("temp");
const desc = document.getElementById("desc");
const icon = document.getElementById("icon");

const feels = document.getElementById("feels");
const pressure = document.getElementById("pressure");
const clouds = document.getElementById("clouds");
const wind = document.getElementById("wind");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const ctx = document.getElementById("chart").getContext("2d");

let radarLayer;
let ai = false;

// MAP
const map = L.map("map").setView([52.2,21],6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let marker;

// ---------------- WEATHER ----------------
async function weather(lat, lon){

show();

const r = await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
);

const d = await r.json();

if(!d.main) return;

city.innerText = d.name || "Unknown";
temp.innerText = Math.round(d.main.temp)+"°C";
desc.innerText = d.weather[0].description;

feels.innerText = d.main.feels_like;
pressure.innerText = d.main.pressure;
clouds.innerText = d.clouds.all;
wind.innerText = d.wind.speed;
sunrise.innerText = time(d.sys.sunrise);
sunset.innerText = time(d.sys.sunset);

setIcon(d.weather[0].main);
fx(d.weather[0].main);
chartMock(d.main.temp);

hide();

}

// ---------------- ICON ----------------
function setIcon(t){
const m={
Clear:"https://cdn-icons-png.flaticon.com/512/869/869869.png",
Rain:"https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
Clouds:"https://cdn-icons-png.flaticon.com/512/414/414825.png",
Snow:"https://cdn-icons-png.flaticon.com/512/642/642102.png"
};
icon.src=m[t]||"";
}

// ---------------- MAP ----------------
map.on("click",e=>{
const {lat,lng}=e.latlng;

if(marker) map.removeLayer(marker);
marker=L.marker([lat,lng]).addTo(map);

weather(lat,lng);
});

// ---------------- GPS ----------------
function gps(){
navigator.geolocation.getCurrentPosition(p=>{
map.flyTo([p.coords.latitude,p.coords.longitude],10);
weather(p.coords.latitude,p.coords.longitude);
});
}

// ---------------- RADAR ----------------
function toggleRadar(){

if(!radarLayer){
radarLayer=L.tileLayer(
"https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid="+apiKey
).addTo(map);
}else{
map.removeLayer(radarLayer);
radarLayer=null;
}
}

// ---------------- FX ----------------
function fx(t){
let fx=document.getElementById("fx");
fx.className="";
if(t==="Rain")fx.classList.add("rain");
if(t==="Snow")fx.classList.add("snow");
}

// ---------------- CHART (fake GOD MODE smooth visual) ----------------
function chartMock(temp){

ctx.clearRect(0,0,400,200);

for(let i=0;i<10;i++){
ctx.fillStyle="cyan";
ctx.fillRect(i*35,100-(Math.random()*50),20,50);
}
}

// ---------------- TIME ----------------
function time(t){
return new Date(t*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
}

// ---------------- AI MODE (FAKE UX LAYER) ----------------
function toggleAI(){
ai=!ai;
document.getElementById("ai").style.display=ai?"block":"none";
document.getElementById("ai").innerText =
ai ? "AI: analyzing weather patterns..." : "AI MODE OFF";
}

// ---------------- LOADING ----------------
function show(){document.getElementById("loading").style.display="block";}
function hide(){document.getElementById("loading").style.display="none";}

// ---------------- START ----------------
weather(52.2,21);
