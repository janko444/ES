const apiKey = "739098adcbab3596715447d628e4e1c9";

// UI
const city = document.getElementById("city");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");

// MAPA
const map = L.map('map').setView([52.2297, 21.0122], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let marker;

// ==========================
// 📍 MARKER
// ==========================
function setMarker(lat, lon){
  if(marker) map.removeLayer(marker);
  marker = L.marker([lat, lon]).addTo(map);
}

// ==========================
// 🌍 REVERSE GEOCODING
// ==========================
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

  } catch{
    return "Nieznana lokalizacja";
  }
}

// ==========================
// 🌦️ POGODA (FIX + PRO)
// ==========================
async function getWeatherByCoords(lat, lon){

  try{

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    const data = await res.json();

    // ❗ FIX: sprawdzanie błędu API
    if(!data || data.cod !== 200 || !data.main){
      showError();
      return;
    }

    const placeName = await getCityName(lat, lon);

    city.innerText = placeName;
    temperature.innerText = Math.round(data.main.temp) + "°C";
    description.innerText = data.weather[0].description;
    humidity.innerText = data.main.humidity + "%";
    wind.innerText = data.wind.speed + " km/h";

    changeTheme(data.weather[0].main);

  } catch(err){
    showError();
  }
}

// ==========================
// ❌ ERROR UI
// ==========================
function showError(){
  city.innerText = "Brak danych 🌍";
  temperature.innerText = "--°C";
  description.innerText = "Nie udało się pobrać pogody";
  humidity.innerText = "--%";
  wind.innerText = "-- km/h";
}

// ==========================
// 🎨 THEMES PRO
// ==========================
function changeTheme(type){

  const themes = {
    Clouds: {
      img: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
      bg: "linear-gradient(135deg,#4b5563,#111827)"
    },
    Rain: {
      img: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
      bg: "linear-gradient(135deg,#1e3a8a,#0f172a)"
    },
    Clear: {
      img: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
      bg: "linear-gradient(135deg,#f59e0b,#f97316)"
    },
    Snow: {
      img: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
      bg: "linear-gradient(135deg,#cbd5e1,#64748b)"
    }
  };

  const t = themes[type];

  if(t){
    weatherIcon.src = t.img;
    document.body.style.background = t.bg;
  }
}

// ==========================
// 🖱️ CLICK MAP
// ==========================
map.on("click", (e)=>{

  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  setMarker(lat, lon);
  getWeatherByCoords(lat, lon);

});

// ==========================
// 📍 MOJA LOKALIZACJA (PRO)
// ==========================
function myLocation(){

  if(!navigator.geolocation){
    alert("Brak GPS w przeglądarce");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos)=>{

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    map.setView([lat, lon], 10);

    setMarker(lat, lon);
    getWeatherByCoords(lat, lon);

  });
}

// ==========================
// 🚀 START
// ==========================
getWeatherByCoords(52.2297, 21.0122);
