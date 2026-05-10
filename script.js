const apiKey = "739098adcbab3596715447d628e4e1c9";

// UI
const city = document.getElementById("city");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");

const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

// CACHE
const cache = {};

// MAPA
const map = L.map('map').setView([52.2297, 21.0122], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let marker;
let radarLayer;

// ---------------- CACHE ----------------
function getCache(key){
  if(cache[key] && Date.now() - cache[key].time < 60000){
    return cache[key].data;
  }
  return null;
}

function setCache(key, data){
  cache[key] = { data, time: Date.now() };
}

// ---------------- LOADING ----------------
function showLoading(){
  document.getElementById("loading").style.display = "block";
}

function hideLoading(){
  document.getElementById("loading").style.display = "none";
}

// ---------------- MARKER ----------------
function setMarker(lat, lon){
  if(marker) map.removeLayer(marker);
  marker = L.marker([lat, lon]).addTo(map);
}

// ---------------- GEO ----------------
async function getCityName(lat, lon){
  try{
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();

    return data.address.city ||
           data.address.town ||
           data.address.village ||
           data.address.state ||
           data.display_name;

  } catch {
    return "Nieznana lokalizacja";
  }
}

// ---------------- RADAR ----------------
function addRadar(){
  if(radarLayer) map.removeLayer(radarLayer);

  radarLayer = L.tileLayer(
    "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=" + apiKey,
    { opacity: 0.6 }
  );

  radarLayer.addTo(map);
}

// ---------------- WEATHER FX ----------------
function setFX(type){

  let fx = document.getElementById("fx");

  if(!fx){
    fx = document.createElement("div");
    fx.id = "fx";
    document.body.appendChild(fx);
  }

  fx.className = "";

  if(type === "Rain") fx.classList.add("rain");
  if(type === "Snow") fx.classList.add("snow");
}

// ---------------- THEME ----------------
function changeTheme(type, temp){

  const t = {
    Clouds: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    Rain: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
    Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
    Snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png"
  };

  if(t[type]) weatherIcon.src = t[type];

  if(temp > 30){
    document.body.style.filter = "hue-rotate(30deg)";
  } else if(temp < 5){
    document.body.style.filter = "hue-rotate(180deg)";
  } else {
    document.body.style.filter = "none";
  }

  setFX(type);
}

// ---------------- CHART ----------------
function drawChart(data){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const temps = data.list.slice(0,8).map(x => x.main.temp);
  const step = canvas.width / temps.length;

  ctx.beginPath();

  temps.forEach((t,i)=>{
    const x = i * step;
    const y = 100 - (t * 3);

    if(i === 0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });

  ctx.strokeStyle = "cyan";
  ctx.stroke();
}

// ---------------- FORECAST ----------------
async function getForecast(lat, lon){

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  const data = await res.json();
  drawChart(data);
}

// ---------------- WEATHER CORE ----------------
async function getWeatherByCoords(lat, lon){

  const key = `${lat},${lon}`;
  const cached = getCache(key);

  if(cached){
    updateUI(cached, lat, lon);
    return;
  }

  showLoading();

  try{

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    const data = await res.json();

    if(!res.ok || data.cod !== 200 || !data.main){
      throw new Error("API error");
    }

    setCache(key, data);

    updateUI(data, lat, lon);

  } catch(e){
    console.error(e);
    showError();
  }

  hideLoading();
}

// ---------------- UI UPDATE ----------------
async function updateUI(data, lat, lon){

  const name = await getCityName(lat, lon);

  city.innerText = name;
  temperature.innerText = Math.round(data.main.temp) + "°C";
  description.innerText = data.weather[0].description;
  humidity.innerText = data.main.humidity + "%";
  wind.innerText = data.wind.speed + " km/h";

  changeTheme(data.weather[0].main, data.main.temp);

  getForecast(lat, lon);
}

// ---------------- ERROR ----------------
function showError(){
  city.innerText = "Brak danych";
  temperature.innerText = "--°C";
  description.innerText = "Błąd API";
  humidity.innerText = "--%";
  wind.innerText = "-- km/h";
}

// ---------------- MAP CLICK ----------------
map.on("click", (e)=>{

  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  setMarker(lat, lon);
  getWeatherByCoords(lat, lon);

});

// ---------------- GPS ----------------
function myLocation(){

  if(!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition((pos)=>{

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    map.flyTo([lat, lon], 10);

    setMarker(lat, lon);
    getWeatherByCoords(lat, lon);

  });

}

// ---------------- START ----------------
addRadar();
getWeatherByCoords(52.2297, 21.0122);
