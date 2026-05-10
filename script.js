
// ================= API =================
const apiKey = "739098adcbab3596715447d628e4e1c9";

// ================= UI =================
const city = document.getElementById("city");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");

const feels = document.getElementById("feels");
const pressure = document.getElementById("pressure");
const clouds = document.getElementById("clouds");
const windDir = document.getElementById("windDir");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

// ================= CACHE =================
const cache = {};

// ================= MAPA =================
const map = L.map('map').setView([52.2297, 21.0122], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let marker;

// ================= RADAR =================
let radarLayer;

function addRadar(){
  radarLayer = L.tileLayer(
    "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=" + apiKey,
    { opacity: 0.6 }
  );

  radarLayer.addTo(map);
}

// ================= CACHE =================
function getCache(key){
  if(cache[key] && Date.now() - cache[key].time < 60000){
    return cache[key].data;
  }
  return null;
}

function setCache(key, data){
  cache[key] = { data, time: Date.now() };
}

// ================= MARKER =================
function setMarker(lat, lon){
  if(marker) map.removeLayer(marker);
  marker = L.marker([lat, lon]).addTo(map);
}

// ================= GEO =================
async function getCityName(lat, lon){
  try{
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );

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

// ================= WIND DIR =================
function getWindDirection(deg){
  if(deg > 337.5 || deg < 22.5) return "N";
  if(deg < 67.5) return "NE";
  if(deg < 112.5) return "E";
  if(deg < 157.5) return "SE";
  if(deg < 202.5) return "S";
  if(deg < 247.5) return "SW";
  if(deg < 292.5) return "W";
  return "NW";
}

// ================= TIME =================
function formatTime(t){
  return new Date(t * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ================= THEME + FX =================
function changeTheme(type, temp){

  const themes = {
    Clouds: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    Rain: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
    Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
    Snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png"
  };

  if(themes[type]) weatherIcon.src = themes[type];

  document.body.style.filter =
    temp > 30 ? "hue-rotate(30deg)" :
    temp < 5 ? "hue-rotate(180deg)" :
    "none";

  setFX(type);
}

// ================= WEATHER FX =================
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

// ================= CHART =================
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

// ================= FORECAST =================
async function getForecast(lat, lon){

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  const data = await res.json();

  drawChart(data);
}

// ================= UI UPDATE =================
async function updateUI(data, lat, lon){

  const name = await getCityName(lat, lon);

  city.innerText = name;
  temperature.innerText = Math.round(data.main.temp) + "°C";
  description.innerText = data.weather[0].description;
  humidity.innerText = data.main.humidity + "%";
  wind.innerText = data.wind.speed + " km/h";

  // EXTRA PRO DATA
  feels.innerText = Math.round(data.main.feels_like) + "°C";
  pressure.innerText = data.main.pressure + " hPa";
  clouds.innerText = data.clouds.all + "%";
  windDir.innerText = getWindDirection(data.wind.deg);
  sunrise.innerText = formatTime(data.sys.sunrise);
  sunset.innerText = formatTime(data.sys.sunset);

  changeTheme(data.weather[0].main, data.main.temp);

  getForecast(lat, lon);
}

// ================= ERROR =================
function showError(){
  city.innerText = "Brak danych";
  temperature.innerText = "--°C";
  description.innerText = "Błąd API";
}

// ================= WEATHER CORE =================
async function getWeatherByCoords(lat, lon){

  const key = `${lat},${lon}`;
  const cached = getCache(key);

  if(cached){
    updateUI(cached, lat, lon);
    return;
  }

  try{

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    const data = await res.json();

    if(!res.ok || data.cod !== 200 || !data.main){
      showError();
      return;
    }

    setCache(key, data);

    updateUI(data, lat, lon);

  } catch{
    showError();
  }
}

// ================= MAP CLICK =================
map.on("click", (e)=>{

  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  setMarker(lat, lon);
  getWeatherByCoords(lat, lon);

});

// ================= GPS =================
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

// ================= INIT =================
addRadar();
getWeatherByCoords(52.2297, 21.0122);
