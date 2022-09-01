function kelvinToFahrenheit(temperature) {
  return ((temperature - 273.15) * 9) / 5 + 32;
}

function kelvinToCelsius(temperature) {
  return temperature - 272.15;
}

async function loadJson(url) {
  const response = await fetch(url, { mode: 'cors' });
  console.log(url);
  if (response.status === 200) {
    return response.json();
  }
  throw new Error(`${response.status} for ${response.url}`);
}

async function getLocation(city, country, state = '') {
  const encodedCity = encodeURIComponent(city.trim());
  const encodedCountry = encodeURIComponent(country.trim());
  const searchQuery =
    state.length === 0
      ? `${encodedCity},${encodedCountry}`
      : `${encodedCity},${state},${encodedCountry}`;
  const response = await loadJson(
    `http://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=5&appid=58f2669ab93d58441800526b124f17d2`
  );
  console.log(response);
  const locationData = response[0];
  const stateStr = Object.hasOwn(locationData, 'state')
    ? locationData.state
    : '';
  return {
    lat: locationData.lat,
    lon: locationData.lon,
    city: locationData.name,
    state: stateStr,
    countryCode: locationData.country,
  };
}

async function getCountryNameFromCountryCode(countryCode) {
  const countryData = await loadJson(
    `https://restcountries.com/v3.1/alpha?codes=${countryCode}`
  );
  return countryData[0].name.common;
}

async function getWeather(location, units = 'metric') {
  let weatherObj = {};
  try {
    const lat = location.lat.toString();
    const lon = location.lon.toString();
    const weatherData = await loadJson(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=58f2669ab93d58441800526b124f17d2&units=${units}`
    );
    console.log(weatherData);
    weatherObj = {
      city: location.city,
      state: location.state,
      country: await getCountryNameFromCountryCode(location.countryCode),
      main: weatherData.main,
      weather: weatherData.weather[0],
      wind: weatherData.wind,
      units: units,
    };
  } catch (error) {
    console.log(error);
  }
  return weatherObj;
}

async function getCountries() {
  const countriesObj = {};
  try {
    const countriesData = await loadJson('https://restcountries.com/v3.1/all');
    countriesData.forEach((country) => {
      const name = country.name.common;
      const code = country.cca2;
      countriesObj[name] = code;
    });
  } catch (error) {
    console.log(error);
  }
  return countriesObj;
}

async function loadCountries() {
  const countrySelect = document.getElementById('country-select');
  const countriesObj = await getCountries();
  Object.entries(countriesObj)
    .sort()
    .forEach((country) => {
      const option = document.createElement('option');
      const name = country[0];
      const code = country[1];
      option.innerText = name;
      option.value = code;
      countrySelect.appendChild(option);
    });
}

function renderStateSelection() {
  const countrySelect = document.getElementById('country-select');
  const formState = document.getElementById('form-state');
  countrySelect.addEventListener('change', (option) => {
    const countrySelection = option.target.value;
    const stateSelect = document.getElementById('state-select');
    if (countrySelection === 'US') {
      formState.classList.remove('hidden');
    } else {
      formState.classList.add('hidden');
    }
    stateSelect.selectedIndex = 0;
  });
}

function loadStates() {
  const statesArray = [
    'AL',
    'AK',
    'AS',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'DC',
    'FM',
    'FL',
    'GA',
    'GU',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MH',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'MP',
    'OH',
    'OK',
    'OR',
    'PW',
    'PA',
    'PR',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VI',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];
  const stateSelect = document.getElementById('state-select');
  statesArray.forEach((state) => {
    const option = document.createElement('option');
    option.value = state;
    option.innerText = state;
    stateSelect.appendChild(option);
  });
}

function displayWeatherData(weatherData) {
  const weatherInfo = document.getElementById('weather-info');
  const heading = document.getElementById('weather-heading');
  const temp = document.getElementById('temperature');
  const desc = document.getElementById('weather-desc');
  const feelsLike = document.getElementById('temperature-feels-like');
  const tempHigh = document.getElementById('temperature-high');
  const tempLow = document.getElementById('temperature-low');
  const humidity = document.getElementById('humidity');
  const pressure = document.getElementById('pressure');
  const wind = document.getElementById('wind');

  weatherInfo.classList.remove('hidden');

  const locationStr =
    weatherData.state.length === 0
      ? `${weatherData.city}, ${weatherData.country}`
      : `${weatherData.city}, ${weatherData.state}, ${weatherData.country}`;
  heading.innerText = `Weather in ${locationStr}`;

  temp.innerText = `${weatherData.main.temp}\xB0`;
  desc.innerText = weatherData.weather.description;
  feelsLike.innerText = `Feels like: ${weatherData.main.feels_like}\xB0`;
  tempHigh.innerText = `High: ${weatherData.main.temp_max}\xB0`;
  tempLow.innerText = `Low: ${weatherData.main.temp_min}\xB0`;

  let windSpeedStr;
  if (weatherData.units === 'imperial') {
    windSpeedStr = `Wind: ${weatherData.wind.speed} mph`;
  } else {
    windSpeedStr = `Wind: ${(Number(weatherData.wind.speed) * 3.6).toFixed(
      2
    )} km/h`;
  }
  wind.innerText = windSpeedStr;

  humidity.innerText = `Humidity: ${weatherData.main.humidity}%`;
  pressure.innerText = `Pressure: ${weatherData.main.pressure} hPa`;
}

async function processForm(event) {
  event.preventDefault();

  const city = document.forms['location-form'].city.value;
  const country = document.forms['location-form'].country.value;
  const state = document.forms['location-form'].state.value;
  const units = document.forms['location-form'].units.value;

  const locationData = await getLocation(city, country, state);
  const weatherData = await getWeather(locationData, units);

  console.log(weatherData);
  displayWeatherData(weatherData);
}

loadCountries();
renderStateSelection();
loadStates();
const form = document.getElementById('location-form');
form.addEventListener('submit', processForm);
