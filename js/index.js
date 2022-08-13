import freezedConst from "./apis/constants.js";
import getTomorrow from "./apis/tomorrow.js";
import getOpenWeather from "./apis/openweather.js";
import getAccuWeather from "./apis/accuWeather.js";
import getWeatherStack from "./apis/weatherStack.js";
import getStormGlass from "./apis/stormGlass.js";
import utilits from './utilits.js';

let cityObj;
let map;
let meteoData = {
  current: [],
  oneDay: {
    cloudCover: [],
    precipitationIntensity: [],
    temperature: [],
    windGust: [],
    windSpeed: [],
    humidity: [],
    waterTemperature: [],
    waveHeight: []
  },
};
let apis = [
  "meteoTomorrowIo",
  "meteoOpenWeather",
  "meteoAccuWeather",
  "meteoWeatherStack",
  "meteoStormGlass" 
];
let selectedApis = [];
let requestFuncs = {
  meteoTomorrowIo: getTomorrow,
  meteoOpenWeather: getOpenWeather,
  meteoAccuWeather: getAccuWeather,
  meteoWeatherStack: getWeatherStack,
  meteoStormGlass: getStormGlass
};

const renderCity = (obj) => {
  let searchField = document.getElementById('search');
  let city = obj.city || obj.locality;
  searchField.setAttribute("value", utilits.latinize(city));
}

async function search() {
  const searchQuery = document.getElementById('search');
  const city = utilits.latinize(searchQuery.value);
  try {    
    const apikey = freezedConst.API_KEY_ACCUWEATHER;
    const getTimelineURLKey = "https://dataservice.accuweather.com/locations/v1/cities/search";
    const getTimelineParameters = new URLSearchParams({
      apikey,
      q: city,
    }).toString();
    const requestCityAccuWeatherKey = await fetch(getTimelineURLKey + "?" + getTimelineParameters, {method: "GET"});
    if (requestCityAccuWeatherKey.ok) {
      const accuLocation = await requestCityAccuWeatherKey.json();
      alertModal(accuLocation);
    }
  } catch(e) {
    console.error(e);
  }
}

function gettingGeo() {
  const options = {
    maximumAge: 0,
    timeout: 5000,
    enableHighAccuracy: true
  };
  const successGeo = async(geoResult) => {
    const {coords} = geoResult;
    const {latitude, longitude} = coords;
    const requestCity = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode?latitude=${latitude}&longitude=${longitude}&localityLanguageRequested=en&key=${freezedConst.API_KEY_BIGDATA}`);
    if (requestCity.ok) {
      cityObj = await requestCity.json();
      renderCity(cityObj); 
      gettingMap(cityObj);     
    }
  }
  const errorGeo = err => {
    console.error(err.code, err.mess);
    window.alert(mess);
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successGeo, errorGeo, options);    
  }
}

function alertModal(data) {  
  const body = document.querySelector('body');
  const modal = `
    <div class="modal-layer">
      <div class="modal">
        <p>There are a few options in search result. What will you choose?</p>  
        <form name="searchForm">      
          ${data.map(city => {
            return `
              <div class="search-city-variant">
                <label for="${city.Key}">${city.EnglishName} in ${city.Country.EnglishName}</label>
                <input type="radio" name="city" value="${city.Key}" id="${city.Key}" >
              </div>
            `;
          }).join("")}
          <button type="button" class="search-confirm">Ok</button>
          <button type="button" class="search-cancel">Cancel</button>
        </form>
      </div>
    </div>
  `;
  body.insertAdjacentHTML('afterbegin', modal);
  const okButton = document.querySelector('.search-confirm');
  const cancelButton = document.querySelector('.search-cancel');
  okButton.addEventListener('click', function() {
    const key = document.forms.searchForm.city.value;
    if (!key) {
      return;
    }
    const city = data.filter(el => el.Key === key)[0];
    cityObj = city;
    cityObj.city = city.EnglishName;
    cityObj.latitude = city.GeoPosition.Latitude;
    cityObj.longitude = city.GeoPosition.Longitude;
    map.panTo(new L.LatLng(cityObj.latitude, cityObj.longitude));
    const modalNode = document.querySelector('.modal-layer');
    modalNode.remove();
  });
  cancelButton.addEventListener('click', function() {
    const modalNode = document.querySelector('.modal-layer');
    modalNode.remove();
  })
}
function gettingMap(geoObj) {
  const {latitude, longitude} = geoObj;
  map = L.map('map').setView([latitude, longitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  async function onMapClick(e) {
    const {lat, lng} = e.latlng;
    map.panTo(new L.LatLng(lat, lng));
    const requestCity = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode?latitude=${lat}&longitude=${lng}&localityLanguageRequested=en&key=${freezedConst.API_KEY_BIGDATA}`);
    if (requestCity.ok) {
      cityObj = await requestCity.json();
      renderCity(cityObj);
    }
  }
  map.on('click', onMapClick);
}

async function gettingMeteo() {
  meteoData.current = [];
  utilits.clearObject(meteoData.oneDay);
  let apisPromises = new Map();
  selected();
  selectedApis.forEach(api => {
    let data = api.toString();
    apisPromises.set(data, requestFuncs[api](cityObj)); 
  });
  Promise.allSettled([...apisPromises.values()])
    .then(results => {
      results.forEach(result => {
        if (result.status === "fulfilled") {
          const meteoObj = result.value;
          meteoData.current.push(meteoObj);
        }
      });
    })
    .then(() => {
      reduceData(meteoData.current, meteoData.oneDay);
      renderWeatherCards(meteoData.current);
      renderAverage(meteoData.oneDay);
    })
    .catch(err => console.log(err));  
}

function cloudCovIcon(weatherObj) {
  if (weatherObj.cloudCover >= 0 && weatherObj.cloudCover <= 15) {
    return "clear";
  }
  if (weatherObj.cloudCover >= 0 && weatherObj.cloudCover <= 15 && weatherObj.temperature > 30) {
    return "hot02";
  }
  if (weatherObj.cloudCover > 15 && weatherObj.cloudCover < 30 ) {
    return "mostlysunny";
  }
  if (weatherObj.cloudCover >= 30 && weatherObj.cloudCover < 55) {
    return "partlycloudy";
  }
  if (weatherObj.cloudCover >= 55 && weatherObj.cloudCover < 80) {
    return "partlysunny";
  }
  return "cloudy";
}

function renderWeatherCards(datas) {
  const cards = datas.map(data => {
    return renderWeatherCard(data);
  });
  const card = document.querySelector('.container-content-weather');  
  card.innerHTML = "";
  card.insertAdjacentHTML("afterbegin", cards.join(""));
}

function reduceData(data, averData) {  
  data.forEach(meteoObj => {
    for (let [key, value] of Object.entries(meteoObj.currentData)) {
      if (averData.hasOwnProperty(key) && Array.isArray(averData[key])) {
        averData[key].push(+value);
      }
    }    
  });
  for (let [key, value] of Object.entries(averData)) {
    if (value.length) {
      averData[key] = value.filter(el => {
        if (el !== 0 || el !== null || el !== undefined) {
          return el;
        }
      })
      .reduce((acc, curr, index, arr) => {
        return utilits.toRound10(acc + curr / arr.length);
      }, 0);
    }
  }    
  return averData;
}

function renderAverage(averArr) {
  const card = `
    <div class="card-weather card-average">
      <div class="card-weather-sky">
        <div class="card-weather-sky--image">
          <img src="./assets//icons/${cloudCovIcon(averArr)}.png" alt="${cloudCovIcon(averArr)}" title="${cloudCovIcon(averArr)}">
        </div>
        <div class="card-weather-sky--text">
        ${cloudCovIcon(averArr)}
        </div>
      </div>
      <div class="card-weather-temp">
        <div class="card-weather-temp--image">
          <img src="./assets/icons/hot01.png" alt="hot" title="hot">
        </div>
        <div class="card-weather-temp--text">
          ${averArr.temperature}*C
        </div>
      </div>      
      <div class="card-weather-humid">
        <div class="card-weather-humid--image">
          <img src="./assets/icons/rain03.png" alt="humidity" title="humidity">             
        </div>  
        <div class="card-weather-humid--text">
          ${averArr.humidity}
        </div>         
      </div>
      <div class="card-weather-wind">
        <div class="card-weather-wind--image">
          <img src="./assets/icons/windy.png" alt="wind" title="wind">             
        </div> 
        <div class="card-weather-wind--text">
          ${utilits.toRound(averArr.windSpeed)}${averArr.windGust && utilits.toRound(averArr.windGust) !== utilits.toRound(averArr.windSpeed) ? "-" + utilits.toRound(averArr.windGust) : ""} m/s              
        </div>      
      </div>
      <div class="card-weather-wave">
        <div class="card-weather-wave--image">
          <img src="./assets/imgs/pngfind.com-water-emoji-png-68865.png" alt="wave" title="wave">             
        </div> 
        <div class="card-weather-wave--text">
          ${averArr.waveHeight} m   
        </div>      
      </div>
      <div class="card-weather-waterTemp">
        <div class="card-weather-waterTemp--image">
          <img src="./assets/imgs/pngfind.com-wave-png-594184.png" alt="water" title="water">             
        </div> 
        <div class="card-weather-waterTemp--text">
          ${averArr.waterTemperature} *C          
        </div>      
      </div>             
    </div>    
  `;
  const container = document.querySelector('.average-weather');
  container.innerHTML = "";
  container.insertAdjacentHTML("afterbegin", card);
}

function renderWaves(height) {
  const waveContainers = document.querySelectorAll('.card-weather-waveHeight');
  const wave = `
    <img class="wave" src="./assets/imgs/pngfind.com-wave-png-594184.png" alt="wave" title="wave" />
    ${height}
  `;
  waveContainers.forEach(waveContainer => waveContainer.insertAdjacentHTML("afterbegin", wave));
}

function makeSelection() {
  const selections = [...document.querySelectorAll('input[type=checkbox]')];
  selections.forEach(select => select.addEventListener("change", function(event) {
    if (event.target.value === "checked") {
      event.target.value = "unchecked";
    } else {
      event.target.value = "checked";    
    }
    selected();
  }));
}

function selected() {
  const selections = [...document.querySelectorAll('input[type=checkbox]')];
  selectedApis = apis.filter(api => {
    return selections.some(select => {
      return api.endsWith(select.name) && select.value === "checked"; 
    })
  });  
}

function renderWeatherCard(weatherObj) {
  if (!weatherObj.error) {
    return `
      <div class="card-weather ${weatherObj.apiName}">
        <div class="card-weather-APIname">
          <h5>${weatherObj.apiName}</h5>
        </div>
        <div class="card-weather-sky">
          <div class="card-weather-sky--image">
            <img src="./assets/icons/${cloudCovIcon(weatherObj.currentData)}.png" alt="${cloudCovIcon(weatherObj.currentData)}" title="${cloudCovIcon(weatherObj.currentData)}">
          </div>
          <div class="card-weather-sky--text">
          ${cloudCovIcon(weatherObj.currentData)}
          </div>
        </div>
        <div class="card-weather-temp">
          <div class="card-weather-temp--image">
            <img src="./assets/icons/hot01.png" alt="hot" title="hot">
          </div>
          <div class="card-weather-temp--text">
            ${utilits.toRound10(weatherObj.currentData.temperature)}*C
          </div>
        </div>
        <div class="card-weather-secondary">
          <div class="card-weather-humid">
            <div class="card-weather-humid--image">
              <img src="./assets/icons/rain03.png" alt="humidity" title="humidity">             
            </div>  
            <div class="card-weather-humid--text">
              ${Number.isInteger(weatherObj.currentData.humidity) ? weatherObj.currentData.humidity : utilits.toRound(weatherObj.currentData.humidity)}
            </div>         
          </div>
          <div class="card-weather-wind">
            <div class="card-weather-wind--image">
              <img src="./assets/icons/windy.png" alt="wind" title="wind">             
            </div> 
            <div class="card-weather-wind--text">
              ${utilits.toRound(weatherObj.currentData.windSpeed)}${weatherObj.currentData.windGust && utilits.toRound(weatherObj.currentData.windGust) !== utilits.toRound(weatherObj.currentData.windSpeed) ? "-" + utilits.toRound(weatherObj.currentData.windGust) : ""} m/s              
            </div>      
          </div>
          <div class="card-weather-waveHeight">
            ${weatherObj.waveHeight ? renderWaves(weatherObj.waveHeight) : ""}
          </div>
        </div>
      </div>     
    `;
  } else {
    return `
    <div class="card-weather ${weatherObj.apiName}">
      <div class="card-weather-APIname">
        <h5>${weatherObj.apiName}</h5>
      </div>
      <div class="api-error">
        <img src="./assets/imgs/no-data-icon-4.jpg" alt="no data" title="${weatherObj.error.message}" />
      </div>
    </div>
    `;
  } 
}

function renderDate() {
  let now = new Date();
  let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, now.getHours());
  const labelsNow = document.querySelectorAll('.slider-date-now');
  const labelTomorrow = document.querySelector('.slider-date-tomorrow')
  labelsNow.forEach(label => label.textContent = now.toLocaleDateString());
  labelTomorrow.textContent = tomorrow.toLocaleDateString();
}

function init() {
  renderDate();
  gettingGeo(); 
  makeSelection();
  const buttonSearch = document.querySelector('.city-name-button--search');
  const buttonShow = document.querySelector('.city-name-button--show');
  buttonSearch.addEventListener('click', search);
  buttonShow.addEventListener('click', gettingMeteo);
}

init();