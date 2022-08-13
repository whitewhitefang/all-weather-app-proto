import freezedConst from "./constants.js";
import utilits from "../utilits.js";

const getStormGlass = async (coords) => {
  const stormGlassObj = {
    apiName: "Storm Glass",
    currentData: {}
  };
  const lat = coords.latitude;
  const lng = coords.longitude;
  const params = [
    "waterTemperature", "waveHeight", "windSpeed", "airTemperature", "precipitation", "gust", "cloudCover", "humidity"
  ];
  const start = Date.now();
  const end = start + 3600000;
  const source = [
    "sg", "icon", "dwd", "meteo"
  ];
  const getTimelineURLKey = `https://api.stormglass.io/v2/weather/point`; 
  const getTimelineParameters = new URLSearchParams({
    lat,
    lng,
    params,
    start,
    end,
    source
  }).toString();    
  try {        
    const requestStormGlass = await fetch(getTimelineURLKey + "?" + getTimelineParameters, {method: "GET", headers: {
        'Authorization': freezedConst.API_KEY_STORMGLASS
      }});
    if (requestStormGlass.ok) {
      const stormGlassWeatherRawData = await requestStormGlass.json();
      const stormGlassWeatherData = stormGlassWeatherRawData.hours[0];      
      const data = {
        cloudCover: stormGlassWeatherData.cloudCover,
        temperature: stormGlassWeatherData.airTemperature,
        precipitationIntensity: stormGlassWeatherData.precipitation,
        precipitationType: null,
        windGust: stormGlassWeatherData.gust,
        windSpeed: stormGlassWeatherData.windSpeed,
        humidity: stormGlassWeatherData.humidity,
        waterTemperature: stormGlassWeatherData.waterTemperature,
        waveHeight: stormGlassWeatherData.waveHeight
      };
      utilits.toReduce(data);
      data.precipitationType = data.precipitationIntensity <= 0 ? null : data.temperature > 0 ? "Rain" : "Snow";
      stormGlassObj.currentData = data;
    } else {
      throw new Error();
    };
    return stormGlassObj;   
  } catch(err) {
    stormGlassObj.error = err;
    console.log(err);
    return stormGlassObj;
  }  
}

export default getStormGlass;