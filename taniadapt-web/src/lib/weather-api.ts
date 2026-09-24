import { WeatherData, HourlyWeather } from './types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'precipitation_probability',
      'wind_speed_10m',
      'soil_moisture_0_to_7cm',
      'shortwave_radiation',
    ].join(','),
    timezone: 'Asia/Jakarta',
    forecast_days: '2',
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error || !data.hourly || !Array.isArray(data.hourly.time)) {
    throw new Error('Data cuaca tidak valid atau dalam mode offline');
  }
  
  const hourlyData: HourlyWeather[] = data.hourly.time.map((time: string, i: number) => ({
    time,
    temperature_2m: data.hourly.temperature_2m[i],
    relative_humidity_2m: data.hourly.relative_humidity_2m[i],
    precipitation: data.hourly.precipitation[i],
    precipitation_probability: data.hourly.precipitation_probability[i],
    wind_speed_10m: data.hourly.wind_speed_10m[i],
    soil_moisture_0_to_7cm: data.hourly.soil_moisture_0_to_7cm[i],
    shortwave_radiation: data.hourly.shortwave_radiation[i],
  }));

  // Find the current hour index
  const now = new Date();
  const currentHourIndex = hourlyData.findIndex(h => {
    const hDate = new Date(h.time);
    return hDate.getHours() === now.getHours() && hDate.getDate() === now.getDate();
  });

  const currentIdx = currentHourIndex >= 0 ? currentHourIndex : 0;

  return {
    hourly: hourlyData,
    current: {
      temperature: hourlyData[currentIdx]?.temperature_2m ?? 0,
      wind_speed: hourlyData[currentIdx]?.wind_speed_10m ?? 0,
      humidity: hourlyData[currentIdx]?.relative_humidity_2m ?? 0,
    },
    fetchedAt: new Date().toISOString(),
  };
}
