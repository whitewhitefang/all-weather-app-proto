import freezedConst from "./constants.js";

async function getOpenWeather(objLocation) {
  const meteoOpenWeatherObj = {
    apiName: "Open Weather",
    currentData: {}
  };
  try {
    const {latitude, longitude} = objLocation;
    const appid = freezedConst.API_KEY_OPENWEATHER;
    const lat = latitude;
    const lon = longitude;
    const units = "metric";
    const getTimelineURL = "https://api.openweathermap.org/data/2.5/weather";
    const getTimelineParameters = new URLSearchParams({
      lat,
      lon,
      units,
      appid
    }).toString();
    const requestMeteoOpenWeather = await fetch(getTimelineURL + "?" + getTimelineParameters, {method: "GET"});
    if (requestMeteoOpenWeather.ok) {
      const weatherOpenWeather = await requestMeteoOpenWeather.json();
      const data = {
        cloudCover: weatherOpenWeather.clouds.all,
        precipitationIntensity: weatherOpenWeather.weather[0].main === "Clear" ? null : weatherOpenWeather.weather[0].main === "Clouds" ? null : (weatherOpenWeather.rain || weatherOpenWeather.snow),
        precipitationType: weatherOpenWeather.rain ? "Rain" : weatherOpenWeather.snow ? "Snow" : null,
        temperature: weatherOpenWeather.main.temp,
        windGust: weatherOpenWeather.wind.gust || null,
        windSpeed: weatherOpenWeather.wind.speed,
        humidity: weatherOpenWeather.main.humidity
      };
      meteoOpenWeatherObj.currentData = data;
    };
    return meteoOpenWeatherObj;  
  } catch(err) {
    meteoOpenWeatherObj.error = err;
    console.log(err);
    return meteoOpenWeatherObj;
  }
}  
export default getOpenWeather;