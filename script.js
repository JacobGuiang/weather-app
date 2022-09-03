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
    `https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=5&appid=58f2669ab93d58441800526b124f17d2`
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
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=58f2669ab93d58441800526b124f17d2&units=${units}`
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

function createWeatherDetail(id, name, value) {
  const detailDiv = document.getElementById(id);

  const nameDiv = document.createElement('div');
  nameDiv.innerText = name;

  const valueDiv = document.createElement('div');
  valueDiv.innerText = value;

  detailDiv.appendChild(nameDiv);
  detailDiv.appendChild(valueDiv);
}

function displayWeatherData(weatherData) {
  const weatherInfo = document.getElementById('weather-info');
  weatherInfo.classList.remove('hidden');

  const heading = document.getElementById('weather-heading');
  const temp = document.getElementById('temperature');
  const desc = document.getElementById('weather-desc');

  const locationStr =
    weatherData.state.length === 0
      ? `${weatherData.city}, ${weatherData.country}`
      : `${weatherData.city}, ${weatherData.state}, ${weatherData.country}`;
  heading.innerText = `Weather in ${locationStr}`;

  temp.innerText = `${weatherData.main.temp}\xB0`;
  desc.innerText = weatherData.weather.description;

  createWeatherDetail(
    'temp-feels-like',
    'Feels like',
    `${weatherData.main.feels_like}\xB0`
  );
  createWeatherDetail('temp-high', 'High', `${weatherData.main.temp_max}\xB0`);
  createWeatherDetail('temp-low', 'Low', `${weatherData.main.temp_min}\xB0`);

  let windSpeedStr;
  if (weatherData.units === 'imperial') {
    windSpeedStr = `${weatherData.wind.speed} mph`;
  } else {
    windSpeedStr = `${(Number(weatherData.wind.speed) * 3.6).toFixed(2)} km/h`;
  }
  createWeatherDetail('wind', 'Wind', windSpeedStr);

  createWeatherDetail('humidity', 'Humidity', `${weatherData.main.humidity}%`);
  createWeatherDetail(
    'pressure',
    'Pressure',
    `${weatherData.main.pressure} hPa`
  );

  const weatherId = weatherData.weather.id;
  let backgroundUrl;
  if (weatherId >= 200 && weatherId <= 299) {
    backgroundUrl = 'url("images/thunderstorm.jpg")';
  } else if (weatherId >= 300 && weatherId <= 399) {
    backgroundUrl = 'url("images/drizzle.jpg")';
  } else if (weatherId >= 500 && weatherId <= 599) {
    backgroundUrl = 'url("images/rain.jpg")';
  } else if (weatherId >= 600 && weatherId <= 699) {
    backgroundUrl = 'url("images/snow.jpg")';
  } else if (weatherId >= 700 && weatherId <= 799) {
    backgroundUrl = '';
  } else if (weatherId === 800) {
    backgroundUrl = 'url("images/clear.jpg")';
  } else if (weatherId >= 800 && weatherId <= 899) {
    backgroundUrl = 'url("images/clouds.jpg")';
  }
  document.body.style.backgroundImage = backgroundUrl;
}

function clearWeatherData() {
  const weatherDetails = document.getElementsByClassName(
    'weather-details-item'
  );
  [...weatherDetails].forEach((elem) => {
    elem.replaceChildren();
  });

  const heading = document.getElementById('weather-heading');
  const temp = document.getElementById('temperature');
  const desc = document.getElementById('weather-desc');

  heading.innerText = '';
  temp.innerText = '';
  desc.innerText = '';
}

async function processForm(event) {
  event.preventDefault();

  clearWeatherData();

  const city = document.forms['weather-form'].city.value;
  const country = document.forms['weather-form'].country.value;
  const state = document.forms['weather-form'].state.value;
  const units = document.forms['weather-form'].units.value;

  const locationData = await getLocation(city, country, state);
  const weatherData = await getWeather(locationData, units);

  console.log(weatherData);
  displayWeatherData(weatherData);
}

loadCountries();
renderStateSelection();
loadStates();
const form = document.getElementById('weather-form');
form.addEventListener('submit', processForm);
