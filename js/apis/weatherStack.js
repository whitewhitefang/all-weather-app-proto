import freezedConst from "./constants.js";
import utilits from '../utilits.js';

async function getWeatherStack(objCity) {
  const meteoWeatherStackObj = {
    apiName: "Weather Stack",
    currentData: {}
  };
  try {
    let city = objCity.city || objCity.locality;
    city = utilits.latinize(city);
    const getTimelineURL = "http://api.weatherstack.com/current";
    const access_key = freezedConst.API_KEY_WEATHERSTACK;
    const units = "m";
    const getTimelineParameters = new URLSearchParams({
      access_key,
      query: city,
      units
    }).toString();
    const requestMeteoWeatherStack = await fetch(getTimelineURL + "?" + getTimelineParameters, {method: "GET"});
    if (requestMeteoWeatherStack.ok) {
      const weatherWeatherStack = await requestMeteoWeatherStack.json();
      const data = {
        cloudCover: weatherWeatherStack.current.cloudcover,
        precipitationIntensity: weatherWeatherStack.current.precip,
        precipitationType: null,
        temperature: weatherWeatherStack.current.temperature,
        windGust: null,
        windSpeed: utilits.speedFromKiloToMeters(weatherWeatherStack.current.wind_speed),
        humidity: weatherWeatherStack.current.humidity
      };
      meteoWeatherStackObj.currentData = data;
    };
    return meteoWeatherStackObj;    
  } catch(err) {
    meteoWeatherStackObj.error = err;
    console.log(err);
    return meteoWeatherStackObj;
  }
}  
export default getWeatherStack;