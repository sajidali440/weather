const apiKey = "48e3f57cfef26e750dfb4997ef7c54eb";
const defaultCity = "Petlad";
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&appid=${apiKey}&units=metric`;

async function fetchWeather() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    document.getElementById("location").textContent = `Weather in ${data.name}`;
    document.getElementById("temperature").textContent = `${data.main.temp}°C`;
    document.getElementById("description").textContent = data.weather[0].description;
    document.getElementById("humidity").textContent =` Humidity: ${data.main.humidity}%`;
    document.getElementById("wind").textContent =` Wind: ${data.wind.speed} m/s`;
    document.getElementById("feels").textContent =` Feels like: ${data.main.feels_like}°C`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById("temperature").textContent = "Unable to load weather.";
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

// Load theme from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

fetchWeather();
