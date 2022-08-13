import freezedConst from "./constants.js";
import utilits from "../utilits.js";

const getAccuWeather = async (objCity) => {
  const meteoAccuWeatherObj = {
    apiName: "Accu Weather",
    currentData: {}
  };
  try {    
    let city = objCity.city || objCity.locality;
    city = utilits.latinize(city);
    const apikey = freezedConst.API_KEY_ACCUWEATHER;
    const getTimelineURLKey = "https://dataservice.accuweather.com/locations/v1/cities/search";
    const getTimelineParameters = new URLSearchParams({
      apikey,
      q: city,
    }).toString();
    const requestCityAccuWeatherKey = await fetch(getTimelineURLKey + "?" + getTimelineParameters, {method: "GET"});
    if (requestCityAccuWeatherKey.ok) {
      const accuLocation = await requestCityAccuWeatherKey.json();
      const locationKey = accuLocation[0].Key;
      const details = true;
      const getTimelineURL = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}`;
      const getTimelineParameters = new URLSearchParams({
        apikey,
        details
      }).toString();
      const requestAccuWeather = await fetch(getTimelineURL + "?" + getTimelineParameters, {method: "GET"});
      if (requestAccuWeather.ok) {
        const accuWeatherData = await requestAccuWeather.json();
        const data = {
          cloudCover: accuWeatherData[0].CloudCover,
          precipitationIntensity: accuWeatherData[0].Precip1hr.Metric.Value,
          precipitationType: accuWeatherData[0].HasPrecipitation ? accuWeatherData[0].PrecipitationType : null,
          temperature: accuWeatherData[0].Temperature.Metric.Value,
          windGust: utilits.speedFromKiloToMeters(accuWeatherData[0].WindGust.Speed.Metric.Value) || null,
          windSpeed: utilits.speedFromKiloToMeters(accuWeatherData[0].Wind.Speed.Metric.Value),
          humidity: accuWeatherData[0].RelativeHumidity
        };
        meteoAccuWeatherObj.currentData = data;
        };
      return meteoAccuWeatherObj;
    }      
  } catch(err) {
    meteoAccuWeatherObj.error = err;
    console.log(err);
    return meteoAccuWeatherObj;
  }  
}

export default getAccuWeather;