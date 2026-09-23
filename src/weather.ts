console.log("Percobaan ke-1 (Basic)")

const url = "https://api.open-meteo.com/v1/forecast";

const params = new URLSearchParams({
  latitude: "-7.3274",
  longitude: "108.2207",
  current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
  timezone: "Asia/Jakarta"
});

const response = await fetch(`${url}?${params}`);

console.log("Status:", response.status);

const data = await response.json();

console.log(data);

////////////////// daily/forecast 7 hari

console.log("Percobaan ke-2 (Daily/Forecast)")

const params2 = new URLSearchParams({
  latitude: "-7.3274",
  longitude: "108.2207",
  daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
  forecast_days: "7",
  timezone: "Asia/Jakarta"
});

const response2 = await fetch(`${url}?${params2}`);

console.log("Status:", response2.status);

const data2 = await response2.json();

console.log(data2);

////////////// Hourly
console.log("Percobaan ke-3 (Hourly)");

const params3 = new URLSearchParams({
  latitude: "-7.3274",
  longitude: "108.2207",
  hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation",
  forecast_days: "2",
  timezone: "Asia/Jakarta"
});

const response3 = await fetch(`${url}?${params3}`);

console.log("Status:", response3.status);

const data3 = await response3.json();

console.log(data3);