interface WeatherData {
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface WeatherInfo {
  currentTemperature: number;
  currentWeather: string;
  todayMaxTemp: number;
  todayMinTemp: number;
  time: string;
}

function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Drizzle: Light intensity",
    53: "Drizzle: Moderate intensity",
    55: "Drizzle: Dense intensity",
    56: "Freezing Drizzle: Light intensity",
    57: "Freezing Drizzle: Dense intensity",
    61: "Rain: Slight intensity",
    63: "Rain: Moderate intensity",
    65: "Rain: Heavy intensity",
    66: "Freezing Rain: Light intensity",
    67: "Freezing Rain: Heavy intensity",
    71: "Snow fall: Slight intensity",
    73: "Snow fall: Moderate intensity",
    75: "Snow fall: Heavy intensity",
    77: "Snow grains",
    80: "Rain showers: Slight intensity",
    81: "Rain showers: Moderate intensity",
    82: "Rain showers: Violent intensity",
    85: "Snow showers slight",
    86: "Snow showers heavy",
    95: "Thunderstorm: Slight or moderate",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  return weatherCodes[code] || "Unknown weather condition";
}

async function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.log("Geolocation error, use tokyo geolocation:", error);
        reject({ lat: 35.6895, lon: 139.6917 }); // Default to Tokyo coordinates
      }
    );
  });
}

async function fetchWeatherData(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo&forecast_days=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return await response.json();
}

async function getWeatherInfo(): Promise<WeatherInfo> {
  try {
    const position = await getCurrentPosition();

    const weatherData = await fetchWeatherData(position.lat, position.lon);

    const weatherInfo: WeatherInfo = {
      currentTemperature: weatherData.current.temperature_2m | 0,
      currentWeather: getWeatherDescription(weatherData.current.weather_code),
      todayMaxTemp: weatherData.daily.temperature_2m_max[0] | 0,
      todayMinTemp: weatherData.daily.temperature_2m_min[0] | 0,
      time: weatherData.current.time,
    };

    return weatherInfo;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

export default function Weather() {
  const weather = async () => {
    try {
      const w = await getWeatherInfo();
      return w;
    } catch (error) {
      console.error("Error fetching weather info:", error);
      return null;
    }
  };

  const [data] = createResource(weather);

  return (
    <div class="montserrat component-box">
      <div>{data() ? `${data()?.currentTemperature}°C` : "Loading..."}</div>
      <div>{data() ? data()?.currentWeather : "Loading..."}</div>
      <div>{data() ? `${data()?.todayMaxTemp}°C` : "Loading..."}</div>
      <div>{data() ? `${data()?.todayMinTemp}°C` : "Loading..."}</div>
      <div>{data() ? data()?.time : "Loading..."}</div>
    </div>
  );
}
