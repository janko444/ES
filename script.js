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

// klik na mapie
map.on("click", async function(e){

  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  if(marker){
    map.removeLayer(marker);
  }

  marker = L.marker([lat, lon]).addTo(map);

  getWeatherByCoords(lat, lon);

});

async function getWeatherByCoords(lat, lon){

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  const res = await fetch(url);
  const data = await res.json();

  city.innerText = data.name || "Nieznane miejsce";
  temperature.innerText = Math.round(data.main.temp) + "°C";
  description.innerText = data.weather[0].description;
  humidity.innerText = data.main.humidity + "%";
  wind.innerText = data.wind.speed + " km/h";

  const type = data.weather[0].main;

  if(type === "Clouds"){
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/414/414825.png";
    document.body.style.background = "linear-gradient(135deg,#4b5563,#111827)";
  }

  else if(type === "Rain"){
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3351/3351979.png";
    document.body.style.background = "linear-gradient(135deg,#1e3a8a,#0f172a)";
  }

  else if(type === "Clear"){
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
    document.body.style.background = "linear-gradient(135deg,#f59e0b,#f97316)";
  }

  else if(type === "Snow"){
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/642/642102.png";
    document.body.style.background = "linear-gradient(135deg,#cbd5e1,#64748b)";
  }

  else{
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
  }
}
