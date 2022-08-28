async function loadJson(url) {
  const response = await fetch(url, { mode: "cors" });
  if (response.status === 200) {
    return response.json();
  }
  throw new Error(`${response.status} for ${response.url}`);
}

async function getWeather(location) {
  let weatherObj;
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

(async () => {
  console.log(await getWeather("dallas"));
})();
