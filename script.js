const apiKey = "48e3f57cfef26e750dfb4997ef7c54eb";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitToggle = document.getElementById("unitToggle");
const themeToggle = document.getElementById("themeToggle");
const loader = document.getElementById("loader");
const currentWeather = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecast");
const forecastCards = document.getElementById("forecastCards");
const cityNameHeader = document.getElementById("cityName");

let currentUnit = unitToggle.value;

// Load saved theme
window.onload = () => {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
  }

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      showLoader();
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${currentUnit}`;
        const response = await fetch(url);
        const data = await response.json();
        
        cityInput.value = data.name;
        cityNameHeader.textContent = `${data.name}, ${data.sys.country}`;
        
        renderCurrentWeather(data);
        fetchForecast(latitude, longitude);
        setWeatherBackground(data.weather[0].main.toLowerCase());
      } catch (err) {
        showError("Failed to load weather from your location.");
      } finally {
        hideLoader();
      }
    });
  }
};

// Theme Toggle (Fixed)
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

// Unit Toggle
unitToggle.addEventListener("change", () => {
  currentUnit = unitToggle.value;
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

// Search
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

async function fetchWeatherByCity(city) {
  showLoader();
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;
    const response = await fetch(url);
    const data = await response.json();
    
    cityNameHeader.textContent = `${data.name}, ${data.sys.country}`;
    
    renderCurrentWeather(data);
    fetchForecast(data.coord.lat, data.coord.lon);
    setWeatherBackground(data.weather[0].main.toLowerCase());
  } catch (err) {
    showError("City not found. Try another.");
  } finally {
    hideLoader();
  }
}

function renderCurrentWeather(data) {
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  const unit = currentUnit === "metric" ? "°C" : "°F";

  currentWeather.innerHTML = `
    <div class="weather-main">
      <img src="${icon}" alt="${data.weather[0].description}" class="weather-icon" />
      <div class="temperature">${Math.round(data.main.temp)}°</div>
      <div class="condition">${data.weather[0].description}</div>
    </div>

    <div class="details-grid">
      <div class="detail-item">
        <span>Feels Like</span>
        <strong>${Math.round(data.main.feels_like)}${unit}</strong>
      </div>
      <div class="detail-item">
        <span>Humidity</span>
        <strong>${data.main.humidity}%</strong>
      </div>
      <div class="detail-item">
        <span>Wind</span>
        <strong>${data.wind.speed} ${currentUnit === "metric" ? "m/s" : "mph"}</strong>
      </div>
      <div class="detail-item">
        <span>Pressure</span>
        <strong>${data.main.pressure} hPa</strong>
      </div>
    </div>
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
      <div class="forecast-card">
        <div class="forecast-day">${day.date}</div>
        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.main}" />
        <div class="forecast-temp">${day.temp}°</div>
      </div>
    `).join("");

    forecastSection.classList.remove("hidden");
  } catch (e) {
    console.log("Forecast could not be loaded");
  }
}

function extractDailyForecast(list) {
  const dailyMap = {};
  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyMap[date] && item.dt_txt.includes("12:00:00")) {
      dailyMap[date] = {
        date: new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: "short" }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        main: item.weather[0].main
      };
    }
  });
  return Object.values(dailyMap).slice(0, 5);
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
  currentWeather.innerHTML = `<div class="error">${message}</div>`;
  currentWeather.classList.remove("hidden");
}

function setWeatherBackground(weather) {
  document.body.classList.remove("sunny", "cloudy", "rainy", "storm", "clear");

  const sun = document.querySelector(".sun");
  const clouds = document.querySelectorAll(".cloud");
  const rain = document.querySelector(".rain");
  const lightning = document.querySelector(".lightning");

  sun.style.opacity = "0";
  clouds.forEach(c => c.style.opacity = "0");
  rain.style.opacity = "0";
  lightning.style.opacity = "0";

  const cond = weather.toLowerCase();

  if (cond.includes("clear") || cond.includes("sun")) {
    document.body.classList.add("sunny");
    sun.style.opacity = "1";
  } else if (cond.includes("cloud")) {
    document.body.classList.add("cloudy");
    clouds.forEach(c => c.style.opacity = "0.9");
  } else if (cond.includes("rain") || cond.includes("drizzle")) {
    document.body.classList.add("rainy");
    rain.style.opacity = "1";
    clouds.forEach(c => c.style.opacity = "0.9");
  } else if (cond.includes("storm") || cond.includes("thunder")) {
    document.body.classList.add("storm");
    rain.style.opacity = "1";
    lightning.style.opacity = "1";
  } else {
    document.body.classList.add("clear");
    sun.style.opacity = "1";
  }
}
