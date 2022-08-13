import freezedConst from "./constants.js";

async function getTomorrow(objLocation) {
  const meteoTomorrowObj = {
    apiName: "tomorrow.io",
    currentData: {}
  };
  try {
    const {latitude, longitude} = objLocation;
    const apikey = freezedConst.API_KEY_TOMORROW;
    const location = [latitude, longitude];
    const units = "metric";
    const timesteps = ["current", "1d"];
    const getTimelineURL = "https://api.tomorrow.io/v4/timelines";
    const fields = [
      "precipitationIntensity",
      "precipitationType",
      "windSpeed",
      "windGust",
      "temperature",
      "cloudCover",
      "humidity"
    ];
    const getTimelineParameters = new URLSearchParams({
      apikey,
      location,
      fields,
      units,
      timesteps,
    }).toString();
    const requestMeteoTomorrow = await fetch(getTimelineURL + "?" + getTimelineParameters, {method: "GET", compress: true});
    if (requestMeteoTomorrow.ok) {
      const weatherTomorrow = await requestMeteoTomorrow.json();
      console.log(weatherTomorrow);
      const data = {
        cloudCover: weatherTomorrow.data.timelines[1].intervals[0].values.cloudCover,
        precipitationIntensity: weatherTomorrow.data.timelines[1].intervals[0].values.precipitationIntensity,
        precipitationType: weatherTomorrow.data.timelines[1].intervals[0].values.precipitationType,
        temperature: weatherTomorrow.data.timelines[1].intervals[0].values.temperature,
        windGust: weatherTomorrow.data.timelines[1].intervals[0].values.windGust,
        windSpeed: weatherTomorrow.data.timelines[1].intervals[0].values.windSpeed,
        humidity: weatherTomorrow.data.timelines[1].intervals[0].values.humidity
      };
      meteoTomorrowObj.currentData = data;
    };
    return meteoTomorrowObj;    
  } catch(err) {
    meteoTomorrowObj.error = err;
    console.log(err);
    return meteoTomorrowObj;
  }
}  
export default getTomorrow;