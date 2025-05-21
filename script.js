const apiKey = "48e3f57cfef26e750dfb4997ef7c54eb";

async function getWeather(city) {
  const resultDiv = document.getElementById("weatherResult");
  const loader = document.getElementById("loader");

  if (!city) {
    city = document.getElementById("cityInput").value.trim();
    if (!city) {
      resultDiv.innerHTML = `<div class="error">Please enter a city name.</div>`;
      return;
    }
  }

  resultDiv.innerHTML = "";
  loader.style.display = "block";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    loader.style.display = "none";

    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    const icon = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

    resultDiv.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="${iconUrl}" alt="Weather Icon">
      <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
      <p>Temperature: ${data.main.temp}°C</p>
      <p>Feels Like: ${data.main.feels_like}°C</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
  } catch (err) {
    loader.style.display = "none";
    resultDiv.innerHTML = `<div class="error">${err.message}</div>`;
  }
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      const resultDiv = document.getElementById("weatherResult");
      const loader = document.getElementById("loader");

      loader.style.display = "block";
      resultDiv.innerHTML = "";

      try {
        const response = await fetch(url);
        loader.style.display = "none";

        if (!response.ok) throw new Error("Location not found");

        const data = await response.json();
        const icon = data.weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

        resultDiv.innerHTML = `
          <h2>${data.name}, ${data.sys.country}</h2>
          <img src="${iconUrl}" alt="Weather Icon">
          <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
          <p>Temperature: ${data.main.temp}°C</p>
          <p>Feels Like: ${data.main.feels_like}°C</p>
          <p>Humidity: ${data.main.humidity}%</p>
          <p>Wind Speed: ${data.wind.speed} m/s</p>
        `;
      } catch (err) {
        loader.style.display = "none";
        resultDiv.innerHTML = `<div class="error">${err.message}</div>`;
      }
    }, () => getWeather());
  } else {
    getWeather();
  }
}
