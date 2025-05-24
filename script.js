const apiKey = "48e3f57cfef26e750dfb4997ef7c54eb";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitToggle = document.getElementById("unitToggle");
const themeToggle = document.getElementById("themeToggle");
const loader = document.getElementById("loader");
const currentWeather = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecast");
const forecastCards = document.getElementById("forecastCards");

let currentUnit = unitToggle.value;

window.onload = () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  // Geolocation attempt
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      showLoader();
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${currentUnit}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Location not found");

        const data = await response.json();
        cityInput.value = data.name;
        renderCurrentWeather(data);
        fetchForecast(latitude, longitude);
        setWeatherBackground(data.weather[0].main.toLowerCase());
      } catch (err) {
        showError(err.message);
      } finally {
        hideLoader();
      }
    }, () => {
      console.log("Location access denied or unavailable.");
    });
  }
};

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

unitToggle.addEventListener("change", () => {
  currentUnit = unitToggle.value;
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

async function fetchWeatherByCity(city) {
  showLoader();
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    renderCurrentWeather(data);
    fetchForecast(data.coord.lat, data.coord.lon);
    setWeatherBackground(data.weather[0].main.toLowerCase());
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
}

function renderCurrentWeather(data) {
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const unit = currentUnit === "metric" ? "°C" : "°F";

  currentWeather.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="${icon}" alt="${data.weather[0].description}" />
    <ul class="weather-list">
      <li><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</li>
      <li>Temperature: ${data.main.temp}${unit}</li>
      <li>Feels Like: ${data.main.feels_like}${unit}</li>
      <li>Humidity: ${data.main.humidity}%</li>
      <li>Wind: ${data.wind.speed} ${currentUnit === "metric" ? "m/s" : "mph"}</li>
      <li>Pressure: ${data.main.pressure} hPa</li>
      <li>Sunrise: ${formatTime(data.sys.sunrise, data.timezone)}</li>
      <li>Sunset: ${formatTime(data.sys.sunset, data.timezone)}</li>
    </ul>
  `;
  currentWeather.classList.remove("hidden");
}

async function fetchForecast(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;
    const response = await fetch(url);
    const data = await response.json();

    const daily = extractDailyForecast(data.list);
    forecastCards.innerHTML = daily.map(day => `
      <div class="card">
        <p>${day.date}</p>
        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" />
        <p>${day.temp}${currentUnit === "metric" ? "°C" : "°F"}</p>
        <p>${day.main}</p>
      </div>
    `).join("");

    forecastSection.classList.remove("hidden");
  } catch {
    forecastSection.classList.add("hidden");
  }
}

function extractDailyForecast(list) {
  const dailyMap = {};
  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyMap[date] && item.dt_txt.includes("12:00:00")) {
      dailyMap[date] = {
        date: new Date(item.dt * 1000).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric"
        }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        main: item.weather[0].main
      };
    }
  });
  return Object.values(dailyMap).slice(0, 5);
}

// UPDATED: 12-hour format with AM/PM
function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

function showLoader() {
  loader.classList.remove("hidden");
  currentWeather.classList.add("hidden");
  forecastSection.classList.add("hidden");
}
function hideLoader() {
  loader.classList.add("hidden");
}
function showError(message) {
  currentWeather.innerHTML = `<p style="color: red;">${message}</p>`;
  currentWeather.classList.remove("hidden");
}

function setWeatherBackground(weather) {
  document.body.classList.remove("sunny", "rainy", "cloudy", "storm", "clear");

  if (weather.includes("cloud")) {
    document.body.classList.add("cloudy");
  } else if (weather.includes("rain") || weather.includes("drizzle")) {
    document.body.classList.add("rainy");
  } else if (weather.includes("clear")) {
    document.body.classList.add("sunny");
  } else if (weather.includes("storm") || weather.includes("thunder")) {
    document.body.classList.add("storm");
  } else {
    document.body.classList.add("clear");
  }
}