async function loadJson(url) {
  const response = await fetch(url, { mode: 'cors' });
  if (response.status === 200) {
    return response.json();
  }
  throw new Error(`${response.status} for ${response.url}`);
}

async function getWeather(location) {
  let weatherObj = {};
  try {
    const weatherData = await loadJson(
      `http://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=58f2669ab93d58441800526b124f17d2`
    );
    weatherObj = {
      city: weatherData.name,
      main: weatherData.main,
      weather: weatherData.weather[0],
      wind: weatherData.wind,
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
      const code = country.ccn3;
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
    if (countrySelection === '840') {
      formState.classList.remove('hidden');
    } else {
      formState.classList.add('hidden');
    }
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

(async () => {
  loadCountries();
  renderStateSelection();
  loadStates();
})();
