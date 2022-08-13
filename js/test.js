
const data = {
  "hours":
    [
      {
        "airTemperature":{"dwd":27.09,"noaa":22.88,"sg":27.09},
        "cloudCover":{"dwd":83.81,"noaa":0.0,"sg":83.81},
        "gust":{"dwd":4.39,"noaa":2.06,"sg":4.39},
        "humidity":{"dwd":77.41,"noaa":51.8,"sg":77.41},
        "precipitation":{"dwd":0.06,"noaa":0.06,"sg":0.06},
        "time":"2022-08-08T07:00:00+00:00",
        "waterTemperature":{"meto":29.73,"noaa":34.1,"sg":29.73},
        "waveHeight":{"dwd":0.55,"icon":0.49,"meteo":0.58,"noaa":0.46,"sg":0.58},
        "windSpeed":{"icon":1.81,"noaa":1.24,"sg":1.81}
      },
      {
        "airTemperature":{"dwd":27.68,"noaa":24.12,"sg":27.68},
        "cloudCover":{"dwd":92.75,"noaa":0.0,"sg":92.75},
        "gust":{"dwd":4.82,"noaa":2.5,"sg":4.82},
        "humidity":{"dwd":69.62,"noaa":49.3,"sg":69.62},
        "precipitation":{"dwd":0.0,"noaa":0.11,"sg":0.0},
        "time":"2022-08-08T08:00:00+00:00",
        "waterTemperature":{"meto":29.75,"noaa":37.59,"sg":29.75},
        "waveHeight":{"dwd":0.55,"icon":0.48,"meteo":0.59,"noaa":0.46,"sg":0.59},
        "windSpeed":{"icon":2.01,"noaa":1.65,"sg":2.01}
      }
    ],
  "meta":
    {
      "cost":1,
      "dailyQuota":10,
      "end":"2022-08-08 08:15",
      "lat":36.2637775,
      "lng":32.329673,
      "params":["waterTemperature","waveHeight","windSpeed","airTemperature","precipitation","gust","cloudCover","humidity"],
      "requestCount":4,
      "start":"2022-08-08 07:00"
    }
};

let data2 = {
  "airTemperature":{"dwd":27.09,"noaa":22.88,"sg":27.09},
  "cloudCover":{"dwd":83.81,"noaa":0.0,"sg":83.81},
  "gust":{"dwd":4.39,"noaa":2.06,"sg":4.39},
  "humidity":{"dwd":77.41,"noaa":51.8,"sg":77.41},
  "precipitation":{"dwd":0.06,"noaa":0.06,"sg":0.06},
  "time":"2022-08-08T07:00:00+00:00",
  "waterTemperature":{"meto":29.73,"noaa":34.1,"sg":29.73},
  "waveHeight":{"dwd":0.55,"icon":0.49,"meteo":0.58,"noaa":0.46,"sg":0.58},
  "windSpeed":{"icon":1.81,"noaa":1.24,"sg":1.81}
};

function getTomorrow() {
  console.log("YEAHHHH");
}

let apis = [
  "meteoTomorrow",
  "meteoOpenWeather",
  "meteoAccuWeather",
  "meteoWeatherStack",
  "meteoStormGlass" 
];

function logMessage(receiver) {
  let name = `@${receiver}`;
  return function(message) {
    let result = `${name}: ${message}`;
    return function(date) {
      return `${result} - ${date.toString()}`
    }
  }
}
console.log(logMessage("Igor")("Hello")(new Date()));


const num = 2.33
console.log(num.toFixed(6))