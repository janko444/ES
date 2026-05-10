const apiKey = "739098adcbab3596715447d628e4e1c9";

// UI
const city = document.getElementById("city");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const icon = document.getElementById("weatherIcon");

const feels = document.getElementById("feels");
const pressure = document.getElementById("pressure");
const clouds = document.getElementById("clouds");
const windDir = document.getElementById("windDir");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const ctx = document.getElementById("chart");

let radar = false;
let favorites = JSON.parse(localStorage.getItem("fav") || "[]");

// MAPA
const map = L.map("map").setView([52.2, 21], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let marker;

// ---------------- FX ----------------
function setFX(type){
  let fx = document.getElementById("fx");
  fx.className = "";

  if(type === "Rain") fx.classList.add("rain");
  if(type === "Snow") fx.classList.add("snow");
}

// ---------------- GEO ----------------
async function geo(lat, lon){
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
  const d = await r.json();
  return d.address.city || d.display_name;
}

// ---------------- WIND ----------------
function windDirFn(d){
  if(d<45) return "N";
  if(d<90) return "E";
  if(d<180) return "S";
  return "W";
}

// ---------------- TIME ----------------
function time(t){
  return new Date(t*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
}

// ---------------- WEATHER ----------------
async function weather(lat, lon){

  show();

  const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const d = await r.json();

  if(!d.main) return;

  const name = await geo(lat, lon);

  city.innerText = name;
  temperature.innerText = Math.round(d.main.temp)+"°C";
  description.innerText = d.weather[0].description;

  feels.innerText = d.main.feels_like+"°C";
  pressure.innerText = d.main.pressure+" hPa";
  clouds.innerText = d.clouds.all+"%";
  windDir.innerText = windDirFn(d.wind.deg);
  sunrise.innerText = time(d.sys.sunrise);
  sunset.innerText = time(d.sys.sunset);

  setIcon(d.weather[0].main);

  fx(d.weather[0].main);

  saveHistory(name);

  hide();
}

// ---------------- ICON ----------------
function setIcon(t){
  const map = {
    Clear:"https://cdn-icons-png.flaticon.com/512/869/869869.png",
    Rain:"https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
    Clouds:"https://cdn-icons-png.flaticon.com/512/414/414825.png",
    Snow:"https://cdn-icons-png.flaticon.com/512/642/642102.png"
  };
  icon.src = map[t] || "";
}

// ---------------- MAP CLICK ----------------
map.on("click", e=>{
  const {lat,lng} = e.latlng;

  if(marker) map.removeLayer(marker);
  marker = L.marker([lat,lng]).addTo(map);

  weather(lat,lng);
});

// ---------------- GPS ----------------
function myLocation(){
  navigator.geolocation.getCurrentPosition(p=>{
    const lat = p.coords.latitude;
    const lon = p.coords.longitude;

    map.flyTo([lat,lon],10);
    weather(lat,lon);
  });
}

// ---------------- RADAR ----------------
function toggleRadar(){
  if(!radar){
    radar = L.tileLayer(
      "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid="+apiKey
    ).addTo(map);
  } else {
    map.removeLayer(radar);
    radar = false;
  }
}

// ---------------- HISTORY ----------------
function saveHistory(name){
  let h = JSON.parse(localStorage.getItem("history")||"[]");
  h.unshift(name);
  h = [...new Set(h)].slice(0,5);
  localStorage.setItem("history", JSON.stringify(h));

  document.getElementById("history").innerHTML =
    "Historia: " + h.join(", ");
}

// ---------------- UI ----------------
function show(){document.getElementById("loading").style.display="block";}
function hide(){document.getElementById("loading").style.display="none";}

// ---------------- START ----------------
weather(52.2,21);
