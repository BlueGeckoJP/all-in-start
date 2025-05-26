import {
  faCloud,
  faCloudSun,
  faCloudSunRain,
  faQuestionCircle,
  faSnowflake,
  faSpinner,
  faSun, // Added for default icon
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { faCloudRain } from "@fortawesome/free-solid-svg-icons/faCloudRain";
import { faSmog } from "@fortawesome/free-solid-svg-icons/faSmog";
import Fa from "solid-fa";

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
  icon: IconDefinition;
}

function getWeatherDescription(code: number): {
  weather: string;
  icon: IconDefinition;
} {
  const weatherCodes: {
    [key: number]: { weather: string; icon: IconDefinition };
  } = {
    0: { weather: "Clear sky", icon: faSun },
    1: { weather: "Mainly clear", icon: faCloudSun },
    2: { weather: "Partly cloudy", icon: faCloudSunRain },
    3: { weather: "Overcast", icon: faCloud },
    45: { weather: "Fog", icon: faSmog },
    48: { weather: "Depositing rime fog", icon: faSmog },
    51: { weather: "Drizzle: Light intensity", icon: faCloudRain },
    53: { weather: "Drizzle: Moderate intensity", icon: faCloudRain },
    55: { weather: "Drizzle: Dense intensity", icon: faCloudRain },
    56: { weather: "Freezing Drizzle: Light intensity", icon: faCloudRain },
    57: { weather: "Freezing Drizzle: Dense intensity", icon: faCloudRain },
    61: { weather: "Rain: Slight intensity", icon: faCloudRain },
    63: { weather: "Rain: Moderate intensity", icon: faCloudRain },
    65: { weather: "Rain: Heavy intensity", icon: faCloudRain },
    66: { weather: "Freezing Rain: Light intensity", icon: faCloudRain },
    67: { weather: "Freezing Rain: Heavy intensity", icon: faCloudRain },
    71: { weather: "Snow fall: Slight intensity", icon: faSnowflake },
    73: { weather: "Snow fall: Moderate intensity", icon: faSnowflake },
    75: { weather: "Snow fall: Heavy intensity", icon: faSnowflake },
    77: { weather: "Snow grains", icon: faSnowflake },
    80: { weather: "Rain showers: Slight intensity", icon: faCloudRain },
    81: { weather: "Rain showers: Moderate intensity", icon: faCloudRain },
    82: { weather: "Rain showers: Violent intensity", icon: faCloudRain },
    85: { weather: "Snow showers slight", icon: faSnowflake },
    86: { weather: "Snow showers heavy", icon: faSnowflake },
    95: { weather: "Thunderstorm: Slight or moderate", icon: faCloudRain },
    96: { weather: "Thunderstorm with slight hail", icon: faCloudRain },
    99: { weather: "Thunderstorm with heavy hail", icon: faCloudRain },
  };

  const description = weatherCodes[code];
  if (description) {
    return description;
  }
  return { weather: "Unknown weather", icon: faQuestionCircle };
}

async function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn(
        "Geolocation is not supported by this browser. Using default coordinates."
      );
      resolve({ lat: 35.6895, lon: 139.6917 }); // Default to Tokyo
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
        console.warn("Geolocation error, using default coordinates:", error);
        resolve({ lat: 35.6895, lon: 139.6917 }); // Default to Tokyo
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
    const weatherDescription = getWeatherDescription(
      weatherData.current.weather_code
    );

    const weatherInfo: WeatherInfo = {
      currentTemperature: weatherData.current.temperature_2m | 0,
      currentWeather: weatherDescription.weather,
      todayMaxTemp: weatherData.daily.temperature_2m_max[0] | 0,
      todayMinTemp: weatherData.daily.temperature_2m_min[0] | 0,
      time: weatherData.current.time,
      icon: weatherDescription.icon,
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
      <Fa icon={data()?.icon || faSpinner} />
    </div>
  );
}
