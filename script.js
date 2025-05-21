const apiKey = "48e3f57cfef26e750dfb4997ef7c54eb";
const defaultCity = "Petlad";

async function getWeatherData(city) {
  const geoRes = await fetch(https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey});
  const geoData = await geoRes.json();
  if (!geoData.length) return alert("City not found.");

  const { lat, lon, name } = geoData[0];

  const weatherRes = await fetch(https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric);
  const weatherData = await weatherRes.json();

  const aqiRes = await fetch(https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey});
  const aqiData = await aqiRes.json();

  updateUI(weatherData, aqiData, name);
}

function updateUI(data, aqi, cityName) {
  document.querySelector(".location").textContent = cityName;
  document.querySelector(".temperature").innerHTML = ${Math.round(data.current.temp)}&deg;;
  document.querySelector(".weather-info").innerHTML =
    ${data.current.weather[0].main} ${Math.round(data.daily[0].temp.min)}&deg;/${Math.round(data.daily[0].temp.max)}&deg; • Air quality: ${aqi.list[0].main.aqi} – <span class="aqi-text">${aqiLevel(aqi.list[0].main.aqi)}</span>;

  const hourlyContainer = document.querySelector(".forecast-hourly");
  hourlyContainer.innerHTML = "";
  data.hourly.slice(0, 5).forEach(hour => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    hourlyContainer.innerHTML += <div class="hour-card">${time}<br><span>${Math.round(hour.temp)}&deg;</span></div>;
  });

  const dailyContainer = document.querySelector(".forecast-daily");
  dailyContainer.innerHTML = "";
  data.daily.slice(0, 5).forEach(day => {
    const date = new Date(day.dt * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    dailyContainer.innerHTML += <div class="day-card">${date}<br>${Math.round(day.temp.min)}&deg;/${Math.round(day.temp.max)}&deg;</div>;
  });

  const stats = document.querySelectorAll(".stat span");
  stats[0].textContent = data.current.uvi;
  stats[1].textContent = ${Math.round(data.current.feels_like)}°;
  stats[2].textContent = ${data.current.humidity}%;
  stats[3].textContent = ${data.current.wind_speed} km/h;
  stats[4].textContent = ${data.current.pressure} hPa;
  stats[5].textContent = ${data.current.visibility / 1000} km;

  const sunset = new Date(data.current.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunrise = new Date(data.current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  document.querySelector(".sun-times").innerHTML = `
    <div>Sunset<br><span>${sunset}</span></div>
    <div>Sunrise<br><span>${sunrise}</span></div>
  `;
}

function aqiLevel(index) {
  const levels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
  return levels[index - 1] || "Unknown";
}

// Initial load
getWeatherData(defaultCity);
