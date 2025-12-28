// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API keys from .env file
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;

// Mapping of country codes to their currencies
const countryCurrencies = {
  'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'JP': 'JPY', 'CN': 'CNY',
  'KZ': 'KZT', 'RU': 'RUB', 'CA': 'CAD', 'AU': 'AUD', 'IN': 'INR',
  'BR': 'BRL', 'MX': 'MXN', 'KR': 'KRW', 'TR': 'TRY', 'SA': 'SAR',
  'AE': 'AED', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'PL': 'PLN',
  'TH': 'THB', 'MY': 'MYR', 'SG': 'SGD', 'NZ': 'NZD', 'ZA': 'ZAR'
};

// Route to get weather data
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city;
    
    // Check if city parameter is provided
    if (!city) {
      return res.status(400).json({ error: 'Please provide a city name' });
    }

    // Make request to OpenWeather API
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    // Extract required data
    const weatherData = {
      temperature: weatherResponse.data.main.temp,
      description: weatherResponse.data.weather[0].description,
      coordinates: {
        lat: weatherResponse.data.coord.lat,
        lon: weatherResponse.data.coord.lon
      },
      feelsLike: weatherResponse.data.main.feels_like,
      windSpeed: weatherResponse.data.wind.speed,
      countryCode: weatherResponse.data.sys.country,
      rain: weatherResponse.data.rain ? weatherResponse.data.rain['3h'] || 0 : 0,
      cityName: weatherResponse.data.name,
      humidity: weatherResponse.data.main.humidity,
      pressure: weatherResponse.data.main.pressure
    };

    // Send data to client
    res.json(weatherData);

  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Server error while fetching weather data' });
    }
  }
});

// Route to get currency exchange rates
app.get('/api/currency', async (req, res) => {
  try {
    const countryCode = req.query.country;
    
    // Check if country parameter is provided
    if (!countryCode) {
      return res.status(400).json({ error: 'Please provide a country code' });
    }

    // Get currency code for the country
    const baseCurrency = countryCurrencies[countryCode] || 'USD';

    // Make request to Exchange Rate API
    const currencyResponse = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`
    );

    // Extract rates for USD, EUR, and KZT
    const rates = currencyResponse.data.conversion_rates;
    
    const currencyData = {
      baseCurrency: baseCurrency,
      rates: {
        USD: rates.USD,
        EUR: rates.EUR,
        KZT: rates.KZT
      }
    };

    // Send data to client
    res.json(currencyData);

  } catch (error) {
    console.error('Error fetching currency data:', error.message);
    res.status(500).json({ error: 'Server error while fetching currency data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open in browser: http://localhost:${PORT}`);
});