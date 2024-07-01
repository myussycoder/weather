const apiKey = 'b96302cb7143dfd128efb9bc29838078';

document.addEventListener('DOMContentLoaded', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherByCoords(lat, lon, true);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

document.getElementById('searchButton').addEventListener('click', function() {
    let location = document.getElementById('locationInput').value;
    if (location) {
        fetchWeather(location);
    }
});

function fetchWeather(location) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                updateWeather(data, false);
                fetchForecast(data.coord.lat, data.coord.lon);
            } else {
                alert('Location not found. Please try again.');
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function fetchWeatherByCoords(lat, lon, isCurrentLocation = false) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                updateWeather(data, isCurrentLocation);
                fetchForecast(lat, lon);
            } else {
                alert('Location not found. Please try again.');
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function fetchForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`;

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => updateForecast(data.daily))
        .catch(error => console.error('Error fetching forecast data:', error));
}

function updateWeather(data, isCurrentLocation) {
    document.querySelector('.location-name').style.opacity = 0;
    document.querySelector('.temperature').style.opacity = 0;
    document.querySelector('.description').style.opacity = 0;
    document.querySelector('.weather-icon').style.opacity = 0;

    setTimeout(() => {
        document.querySelector('.location-name').innerText = isCurrentLocation ? `Current Location: ${data.name}` : data.name;
        document.querySelector('.temperature').innerText = `${Math.round(data.main.temp)}°C`;
        document.querySelector('.description').innerText = data.weather[0].description;
        document.querySelector('.weather-icon').innerText = getWeatherIcon(data.weather[0].icon);

        document.querySelector('.location-name').style.opacity = 1;
        document.querySelector('.temperature').style.opacity = 1;
        document.querySelector('.description').style.opacity = 1;
        document.querySelector('.weather-icon').style.opacity = 1;
    }, 500);
}

function updateForecast(daily) {
    let forecastContainer = document.querySelector('.forecast');
    forecastContainer.innerHTML = '';
    daily.slice(1, 7).forEach((day, index) => {
        let forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `${getDayOfWeek(day.dt)} <br>${getWeatherIcon(day.weather[0].icon)} <br> ${Math.round(day.temp.max)}°C / ${Math.round(day.temp.min)}°C`;
        forecastDay.style.animationDelay = `${index * 0.2}s`;
        forecastContainer.appendChild(forecastDay);
    });
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '🌕',
        '02d': '⛅', '02n': '⛅',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌦️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '❓';
}

function getDayOfWeek(timestamp) {
    const date = new Date(timestamp * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getUTCDay()];
}

document.getElementById('saveSettings').addEventListener('click', function() {
    let units = document.querySelector('input[name="units"]:checked').value;
    let theme = document.querySelector('input[name="theme"]:checked').value;
    alert(`Settings saved!\nUnits: ${units}\nTheme: ${theme}`);
});
