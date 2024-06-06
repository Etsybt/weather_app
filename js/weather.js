import { displayPlaylists } from './spotify.js';

var modal = document.getElementById("loginModal");
var outside = document.getElementById("modal-content");

var loginLink = document.querySelector(".navbar a[href='#loginModal']");

var loginForm = document.getElementById("loginForm");
var signUpForm = document.getElementById("signUpForm");

var registerLink = modal.querySelector(".register-link");
var modalLoginLink = modal.querySelector(".login-link");

function toggleModal() {
  if (modal.style.display === "block") {
    modal.style.display = "none";
  } else {
    modal.style.display = "block";
    loginForm.style.display = "none";
    signUpForm.style.display = "block";
  }
}

loginLink.onclick = toggleModal;

registerLink.onclick = function(event) {
  event.preventDefault();
  loginForm.style.display = "none";
  signUpForm.style.display = "block";
}

modalLoginLink.onclick = function(event) {
  event.preventDefault();
  loginForm.style.display = "block";
  signUpForm.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == outside || event.target == modal) {
    modal.style.display = "none";
  }
}




// API
const apiKey = "7c70a91ce92b4f0e9d6b985f1db672e1";
const currentWeatherApiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiURL = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");

function formatTime(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}


function getCurrentDate(timezone) {
  const currentDate = new Date((new Date().getTime()) + (timezone * 1000));
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return currentDate.toLocaleDateString('en-US', options);
}
async function updateTemperatureDisplay(city) {
  try {
    const response = await fetch(`${currentWeatherApiURL}${city}&appid=${apiKey}`);
    const data = await response.json();
    document.getElementById('current-temp').textContent =  Math.round(data.main.temp) + "°C";
  } catch (error) {
    console.error('Error fetching temperature:', error);
    document.getElementById('current-temp').textContent = 'N/A';
  }
}
async function updateSkyDiplay(city) {
  try {
    const response = await fetch(`${currentWeatherApiURL}${city}&appid=${apiKey}`);
    const data = await response.json();
    document.getElementById('current-sky').textContent = data.weather[0].main;
  } catch (error) {
    console.error('Error fetching weather description:', error);
    document.getElementById('current-sky').textContent = 'N/A';
  }
}

async function check_weather(city) {
  try {
    console.log("Checking weather for city:", city);
    const response = await fetch(currentWeatherApiURL + city + `&appid=${apiKey}`);
    console.log("API response status:", response.status);

    if (response.status == 404) {
      document.querySelector(".error").style.display = "block";
      document.querySelector(".weather").style.display = "none";
      document.querySelector(".five-days").style.display = "none";
      document.querySelector(".music-container").style.display = "none";

      console.log("City not found");
    } else {
      const data = await response.json();
      console.log("Weather data:", data);

      document.querySelector(".city").innerHTML = data.name;
      document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
      document.querySelector(".country").innerHTML = data.sys.country;
      document.querySelector(".time").textContent = formatTime(new Date().getTime() / 1000, data.timezone);
      document.querySelector(".date").textContent = getCurrentDate(data.timezone);
      document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
      document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
      document.querySelector(".pressure").innerHTML = `${data.main.pressure} hPa`;
      document.querySelector(".visibility").innerHTML = `${(data.visibility / 1000).toFixed(2)} km`;

      
      
      const sunriseTime = formatTime(data.sys.sunrise, data.timezone);
      const sunsetTime = formatTime(data.sys.sunset, data.timezone);

      document.querySelector(".sunrise").innerHTML = sunriseTime;
      document.querySelector(".sunset").innerHTML = sunsetTime;

      await updateTemperatureDisplay(city);
      await updateSkyDiplay(city);
      
      const weatherIcon = document.querySelector(".weather-icon");
      const isDayTime = checkDayTime(data.dt, data.sys.sunrise, data.sys.sunset, data.timezone);
      setWeatherIcon(weatherIcon, data.weather[0].main, isDayTime);

      document.querySelector(".weather").style.display = "block";
      document.querySelector(".five-days").style.display = "block";
      document.querySelector(".music-container").style.display = "flex";
      document.querySelector(".error").style.display = "none";
      
      // Display 5-day forecast
      displayFiveDayForecast(city, data.sys.sunrise, data.sys.sunset, data.timezone);

      // Display playlists based on current weather condition
      const currentWeatherCondition = data.weather[0].main.toLowerCase();
      await displayPlaylists(currentWeatherCondition);
    
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function setWeatherIcon(element, weatherMain, isDayTime) {
  const weatherIcons = {
    "Clouds": isDayTime ? "few_clouds" : "night_clouds",
    "Clear": isDayTime ? "clear" : "night_clear",
    "Rain": isDayTime ? "rain" : "night_rain",
    "Drizzle": "drizzle",
    "Mist": isDayTime ? "cloudy" : "night_cloudy",
    "Thunderstorm": isDayTime ? "thunderstorm" : "night_thunderstorm",
    "Snow": "snow",
    "Smoke": "smoke",
    "Haze": "haze",
    "Dust": "dust",
    "Fog": "fog",
    "Sand": "sand",
    "Ash": "ash",
    "Squall": "squall",
    "Tornado": "tornado"
  };
  element.src = `../static/images/${weatherIcons[weatherMain] || (isDayTime ? "clear" : "night_clear")}.png`;
}

function checkDayTime(currentTime, sunrise, sunset, timezone) {
  const currentLocalTime = (currentTime + timezone) % 86400; // seconds in a day
  const sunriseLocalTime = (sunrise + timezone) % 86400;
  const sunsetLocalTime = (sunset + timezone) % 86400;
  
  return currentLocalTime >= sunriseLocalTime && currentLocalTime < sunsetLocalTime;
}

async function displayFiveDayForecast(city, sunrise, sunset, timezone) {
  try {
    const response = await fetch(`${forecastApiURL}${city}&appid=${apiKey}`);
    const data = await response.json();
    console.log("Forecast data:", data);

    if (data.cod !== "200") {
      console.error("Error fetching forecast data:", data.message);
      return;
    }

    const forecastDiv = document.querySelector(".five-days");
    const forecastHeading = forecastDiv.querySelector(".forecast-heading");
    forecastDiv.innerHTML = "";
    forecastDiv.appendChild(forecastHeading);

    for (let i = 0; i < 5; i++) {
      const dayForecast = data.list[i * 8];
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("day");

      const dayIcon = document.createElement("img");
      dayIcon.classList.add("day-icon");

     

      const isDayTime = checkDayTime(dayForecast.dt, sunrise, sunset, timezone);
      setWeatherIcon(dayIcon, dayForecast.weather[0].main, isDayTime);
      dayDiv.appendChild(dayIcon);

      const dayTemp = document.createElement("h1");
      dayTemp.classList.add("temp");
      dayTemp.textContent = `${Math.round(dayForecast.main.temp)}°C`;
      dayDiv.appendChild(dayTemp);

      const dayLabel = document.createElement("div");
      dayLabel.classList.add("day-label");
      dayLabel.textContent = getDayOfWeek(new Date(dayForecast.dt * 1000));
      dayDiv.appendChild(dayLabel);


      const weatherDescription = document.createElement("div");
      weatherDescription.classList.add("weather-description");
      weatherDescription.textContent = dayForecast.weather[0].description;
      dayDiv.appendChild(weatherDescription);

      const humidityDiv = document.createElement("div");
      humidityDiv.classList.add("humidity-container");
      humidityDiv.textContent = `Humidity: ${dayForecast.main.humidity}%`;
      dayDiv.appendChild(humidityDiv);

      forecastDiv.appendChild(dayDiv);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function getDayOfWeek(date) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daysOfWeek[date.getDay()];
}


searchButton.addEventListener("click", () => {
  console.log("Search button clicked");
  check_weather(searchInput.value);
});


