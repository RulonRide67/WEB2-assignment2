// Get DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherResult = document.getElementById('weatherResult');
const currencySection = document.getElementById('currencySection');

// Function to fetch weather data
async function getWeather(city) {
    try {
        // Show loading state
        loading.classList.remove('hidden');
        error.classList.add('hidden');
        weatherResult.classList.add('hidden');

        // Make request to our server for weather
        const weatherResponse = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const weatherData = await weatherResponse.json();

        // Check if request was successful
        if (!weatherResponse.ok) {
            throw new Error(weatherData.error || 'Failed to fetch weather data');
        }

        // Display weather data
        displayWeather(weatherData);

        // Fetch currency data for the country
        getCurrency(weatherData.countryCode);

    } catch (err) {
        // Hide loading and show error
        loading.classList.add('hidden');
        error.textContent = err.message;
        error.classList.remove('hidden');
    }
}

// Function to display weather data
function displayWeather(data) {
    // Update city name
    document.getElementById('cityName').textContent = `${data.cityName}, ${data.countryCode}`;

    // Update weather information
    document.getElementById('temperature').textContent = `${Math.round(data.temperature)}°C`;
    document.getElementById('description').textContent = data.description;
    document.getElementById('feelsLike').textContent = `${Math.round(data.feelsLike)}°C`;
    document.getElementById('windSpeed').textContent = `${data.windSpeed} m/s`;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('pressure').textContent = `${data.pressure} hPa`;
    document.getElementById('coordinates').textContent = `${data.coordinates.lat.toFixed(2)}, ${data.coordinates.lon.toFixed(2)}`;
    document.getElementById('country').textContent = data.countryCode;
    document.getElementById('rain').textContent = data.rain > 0 ? `${data.rain} mm` : 'No rain';

    // Hide loading
    loading.classList.add('hidden');
    
    // Show weather result
    weatherResult.classList.remove('hidden');
}

// Function to fetch currency data
async function getCurrency(countryCode) {
    try {
        // Make request to our server for currency
        const currencyResponse = await fetch(`/api/currency?country=${countryCode}`);
        const currencyData = await currencyResponse.json();

        // Check if request was successful
        if (!currencyResponse.ok) {
            console.error('Failed to fetch currency data');
            return;
        }

        // Display currency data
        displayCurrency(currencyData);

    } catch (err) {
        console.error('Error fetching currency:', err);
    }
}

// Function to display currency data
function displayCurrency(data) {
    const baseCurrency = data.baseCurrency;
    
    document.getElementById('currencyBase').textContent = `Base currency: ${baseCurrency}`;
    
    // Update currency codes (left side - base currency)
    document.getElementById('currencyCode1').textContent = baseCurrency;
    document.getElementById('currencyCode2').textContent = baseCurrency;
    document.getElementById('currencyCode3').textContent = baseCurrency;
    
    // Update currency codes (right side - base currency)
    document.getElementById('currencyCode1b').textContent = baseCurrency;
    document.getElementById('currencyCode2b').textContent = baseCurrency;
    document.getElementById('currencyCode3b').textContent = baseCurrency;
    
    // Calculate and display rates in both directions
    
    // USD rates
    const rateUSD = data.rates.USD;
    document.getElementById('rateUSD').textContent = rateUSD.toFixed(4);
    document.getElementById('rateToUSD').textContent = (1 / rateUSD).toFixed(4);
    
    // EUR rates
    const rateEUR = data.rates.EUR;
    document.getElementById('rateEUR').textContent = rateEUR.toFixed(4);
    document.getElementById('rateToEUR').textContent = (1 / rateEUR).toFixed(4);
    
    // KZT rates
    const rateKZT = data.rates.KZT;
    document.getElementById('rateKZT').textContent = rateKZT.toFixed(2);
    document.getElementById('rateToKZT').textContent = (1 / rateKZT).toFixed(6);

    // Show currency section
    currencySection.classList.remove('hidden');
}

// Event listener for search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

// Event listener for Enter key
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});