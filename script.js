const apiKey = "739098adcbab3596715447d628e4e1c9";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const city = document.getElementById("city");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");

async function getWeather(cityName){

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  const data = await response.json();

  city.innerText = data.name;
  temperature.innerText = Math.round(data.main.temp) + "°C";
  description.innerText = data.weather[0].description;
  humidity.innerText = data.main.humidity + "%";
  wind.innerText = data.wind.speed + " km/h";

  const weatherMain = data.weather[0].main;

  if(weatherMain === "Clouds"){
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/414/414825.png";
    document.body.style.background = "linear-gradient(135deg,#4b5563,#1f2937)";
  }

  else if(weatherMain === "Rain"){
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3351/3351979.png";
    document.body.style.background = "linear-gradient(135deg,#1e3a8a,#0f172a)";
  }

  else if(weatherMain === "Clear"){
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
    document.body.style.background = "linear-gradient(135deg,#f59e0b,#f97316)";
  }

  else if(weatherMain === "Snow"){
    weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/642/642102.png";
    document.body.style.background = "linear-gradient(135deg,#cbd5e1,#94a3b8)";
  }

}

searchBtn.addEventListener("click", () => {

  if(cityInput.value !== ""){
    getWeather(cityInput.value);
  }

});

getWeather("Warsaw");
