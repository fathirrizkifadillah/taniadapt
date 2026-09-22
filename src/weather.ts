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

const response2 = await fetch(`${url}?${params}`);

console.log("Status:", response2.status);

const data2 = await response2.json();

console.log(data2);