const apiKey = "c741d012b8115bda67b476082a958c6a";
const videoElement = document.getElementById("backgroundVideo");

// =======================
// Fetch Weather Data
// =======================
async function fetchWeather(location) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&cnt=40&units=metric&appid=${apiKey}`;
  
    try {
      const [weatherRes, forecastRes] = await Promise.all([fetch(url), fetch(forecastUrl)]);
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
  
      if (weatherData.cod === "404") {
        document.getElementById("selectedCity").textContent = "Location not found";
        return;
      }
  
      updateMainWeather(weatherData);
      updateForecast(forecastData);
      showLocalTime(weatherData);
      
  
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }
  

// =======================
// Show Local Time
// =======================
function showLocalTime(data) {
    const offset = data.timezone;
    const city = data.name;
    const country = data.sys.country;
  
    const nowUTC = new Date();
    const utcTime = nowUTC.getTime() + nowUTC.getTimezoneOffset() * 60000;
    const localTime = new Date(utcTime + offset * 1000);
  
    const formattedTime = localTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  
    const formattedDate = localTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
    const dateTimeElement = document.getElementById('localDateTime');
    if (dateTimeElement) {
      if (city.toLowerCase() === country.toLowerCase()) {
        // Only country was entered
        dateTimeElement.textContent = `Time in ${country}: ${formattedDate} at ${formattedTime}`;
      } else {
        // City was entered
        dateTimeElement.textContent = `Time in ${city}, ${country}: ${formattedDate} at ${formattedTime}`;
      }
    }
  }
  

// =======================
// Set Background Video
// =======================
function setBackgroundVideoByWeather(condition) {
  const videos = {
    Clear: [
      "https://videos.pexels.com/video-files/31488691/13426132_1440_2560_30fps.mp4",
      "https://videos.pexels.com/video-files/31487275/13425592_2560_1440_50fps.mp4"
    ],
    Clouds: [
      "https://videos.pexels.com/video-files/3129769/3129769-uhd_2560_1440_30fps.mp4",
      "https://videos.pexels.com/video-files/855507/855507-sd_640_360_25fps.mp4"
    ],
    Rain: [
      "https://videos.pexels.com/video-files/2491284/2491284-uhd_2732_1440_24fps.mp4",
      "https://videos.pexels.com/video-files/3535854/3535854-hd_1920_1080_30fps.mp4"
    ],
    Snow: [
      "https://videos.pexels.com/video-files/1858244/1858244-uhd_2732_1440_24fps.mp4",
      "https://videos.pexels.com/video-files/3723085/3723085-hd_1920_1080_30fps.mp4"
    ],
    Thunderstorm: [
      "https://videos.pexels.com/video-files/5908584/5908584-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/10651233/10651233-hd_1620_1080_24fps.mp4"
    ],
    Mist: [
      "https://videos.pexels.com/video-files/2711145/2711145-uhd_2560_1440_24fps.mp4",
      "https://videos.pexels.com/video-files/1405527/1405527-hd_1920_1080_30fps.mp4"
    ],
    Haze: [
      "https://videos.pexels.com/video-files/8820216/8820216-uhd_2560_1440_25fps.mp4",
      "https://videos.pexels.com/video-files/31488085/13425828_1080_1920_30fps.mp4"
    ]
  };

  const videoList = videos[condition] || ["https://videos.pexels.com/video-files/855507/855507-sd_640_360_25fps.mp4"];

  const randomVideo = videoList[Math.floor(Math.random() * videoList.length)];

  const videoElement = document.getElementById("backgroundVideo");
  videoElement.src = randomVideo;
  videoElement.load();
  videoElement.play();
}

  
  
  
// =======================
// Update Main Weather UI
// =======================
function updateMainWeather(data) {
  document.querySelector(".text-4xl").textContent = `${Math.round(data.main.temp)}°C`;
  document.querySelector(".text-base").textContent = data.weather[0].description;
  document.getElementById("selectedCity").textContent = `${data.name}, ${data.sys.country}`;

  const mainIcon = document.querySelector(".fa-sun");
  mainIcon.className = getWeatherIcon(data.weather[0].main);
  mainIcon.classList.add("text-6xl");

  setBackgroundVideoByWeather(data.weather[0].main);

  const stats = [
    { icon: "fa-droplet", label: "Humidity", value: `${data.main.humidity}%` },
    { icon: "fa-wind", label: "Wind", value: `${data.wind.speed} km/h` },
    { icon: "fa-temperature-three-quarters", label: "Feels Like", value: `${Math.round(data.main.feels_like)}°C` },
    { icon: "fa-gauge", label: "Pressure", value: `${data.main.pressure} hPa` }
  ];

  document.querySelector(".grid").innerHTML = stats.map(stat => `
    <div class="bg-white/10 p-3 rounded-xl text-center">
      <p class="mb-1"><i class="fas ${stat.icon} mr-1"></i>${stat.label}</p>
      <p class="font-bold text-lg">${stat.value}</p>
    </div>
  `).join("");
}

// =======================
// Update Forecast
// =======================
function updateForecast(data) {
  const forecastContainer = document.getElementById("forecast-scroll");
  forecastContainer.innerHTML = "";

  const dailyForecast = {};
  data.list.forEach(dayData => {
    const date = new Date(dayData.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });

    if (!dailyForecast[day] || date.getHours() === 12) {
      dailyForecast[day] = dayData;
    }
  });

  Object.values(dailyForecast).slice(0, 7).forEach(dayData => {
    const day = new Date(dayData.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });

    forecastContainer.innerHTML += `
      <div class="min-w-[80px] bg-white/10 p-3 rounded-xl text-center">
        <p class="text-sm font-medium">${day}</p>
        <p class="text-lg font-bold">${Math.round(dayData.main.temp)}°C</p>
        <i class="${getWeatherIcon(dayData.weather[0].main)} text-3xl"></i>
        <p class="text-xs">${dayData.weather[0].main}</p>
      </div>
    `;
  });
}

// =======================
// Get Weather Icon
// =======================
function getWeatherIcon(condition) {
  if (!condition || typeof condition !== 'string') return "fas fa-question-circle";

  const icons = {
    "clear": "fas fa-sun text-yellow-400",
    "clouds": "fas fa-cloud text-gray-400",
    "rain": "fas fa-cloud-showers-heavy text-blue-400",
    "drizzle": "fas fa-cloud-rain text-blue-300",
    "thunderstorm": "fas fa-bolt text-yellow-500",
    "snow": "fas fa-snowflake text-cyan-300",
    "mist": "fas fa-smog text-gray-300",
    "haze": "fas fa-smog text-gray-400",
    "smoke": "fas fa-smog text-gray-500",
    "dust": "fas fa-smog text-yellow-300",
    "fog": "fas fa-smog text-gray-400",
    "tornado": "fas fa-wind text-red-400",
    "squall": "fas fa-wind text-blue-300"
  };

  return icons[condition.toLowerCase()] || "fas fa-question-circle";
}

// =======================
// Select City from List
// =======================
function selectCity(city) {
  document.getElementById("cityInput").value = city;
  fetchWeather(city);
  document.getElementById("cityList").classList.add("hidden");
}

// =======================
// Search Event Listener
// =======================
document.getElementById("globalSearch").addEventListener("change", function () {
  fetchWeather(this.value);
});

// =======================
// Auto Fetch on Load
// =======================
window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await res.json();
        const city = data.name;

        if (city) {
          fetchWeather(city);
          document.getElementById("cityInput").value = city;
        }
      } catch (error) {
        console.error("Error getting city from lat/lon:", error);
        document.getElementById("selectedCity").textContent = "Couldn't fetch location";
      }
    }, function (error) {
      console.error("Geolocation error:", error.message);
      document.getElementById("selectedCity").textContent = "Location access denied";
    });
  } else {
    document.getElementById("selectedCity").textContent = "Geolocation not supported";
  }
};
