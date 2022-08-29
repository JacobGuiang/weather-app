async function loadJson(url) {
  const response = await fetch(url, { mode: "cors" });
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
    const countriesData = await loadJson("https://restcountries.com/v3.1/all");
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
  const countrySelect = document.getElementById("countrySelect");
  const countriesObj = await getCountries();
  Object.entries(countriesObj)
    .sort()
    .forEach((country) => {
      const option = document.createElement("option");
      const name = country[0];
      const code = country[1];
      option.innerText = name;
      option.value = code;
      countrySelect.appendChild(option);
    });
}

// TO DO
// function readSelect() {
//   const countrySelect = document.getElementById("countrySelect");
//   countrySelect.addEventListener("change", (option) => {
//     const countrySelection = option.target.value;

//   });
// }

(async () => {
  await loadCountries();
})();
