import type { WeatherData, ForecastData, Coordinates } from "@/types";

/**
 * OpenWeather API response interfaces
 */
interface OpenWeatherCurrentResponse {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  snow?: {
    "1h"?: number;
    "3h"?: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number;
    rain?: {
      "3h": number;
    };
    snow?: {
      "3h": number;
    };
    sys: {
      pod: string;
    };

    dt_txt: string;
  }>;

  city: {
    id: number;

    name: string;
    coord: {
      lat: number;
      lon: number;
    };

    country: string;
    population: number;
    timezone: number;
    sunrise: number;

    sunset: number;
  };
}

interface OpenWeatherOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;

      icon: string;
    }>;
    rain?: { "1h": number };
    snow?: { "1h": number };
  };
  minutely?: Array<{
    dt: number;
    precipitation: number;
  }>;
  hourly: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;

    clouds: number;
    visibility: number;

    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;

    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number;
    rain?: { "1h": number };
    snow?: { "1h": number };
  }>;
  daily: Array<{
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;

      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;

    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;

    uvi: number;
  }>;
  alerts?: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
  }>;
}

/**
 * OpenWeather API service configuration
 */
export interface OpenWeatherConfig {
  provider: "openweathermap";
  apiKey: string;
  baseUrl?: string;
  oneCallVersion?: "2.5" | "3.0";
  units?: "metric" | "imperial" | "standard";
  language?: string;
  timeout?: number;
  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
  retry?: {
    attempts: number;
    delay: number; // in milliseconds
  };
}

/**
 * Default configuration for OpenWeather API
 */
const DEFAULT_CONFIG: Partial<OpenWeatherConfig> = {
  baseUrl: "https://api.openweathermap.org/data",
  timeout: 10000,
  oneCallVersion: "2.5",
  units: "metric",
  language: "en",
  rateLimit: {
    requests: 60,
    window: 60000, // 1 minute
  },
  retry: {
    attempts: 3,
    delay: 1000,
  },
};

/**
 * OpenWeather API service class
 */
export class OpenWeatherApiService {
  private config: OpenWeatherConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private lastRequestTime: number = 0;
  private requestCount: number = 0;

  constructor(config: OpenWeatherConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (!this.config.apiKey) {
      throw new Error("OpenWeather API key is required");
    }
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset count if window has passed
    if (now - this.lastRequestTime > (this.config.rateLimit?.window || 60000)) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    // Check if we've exceeded the rate limit
    if (this.requestCount >= (this.config.rateLimit?.requests || 60)) {
      const waitTime =
        (this.config.rateLimit?.window || 60000) - (now - this.lastRequestTime);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(url: string, signal?: AbortSignal): Promise<T> {
    await this.checkRateLimit();

    const { attempts = 3, delay = 1000 } = this.config.retry || {};
    let lastError: Error;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const fetchOptions: RequestInit = {
          headers: {
            Accept: "application/json",
          },
        };

        if (signal) {
          fetchOptions.signal = signal;
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `OpenWeather API error ${response.status}: ${errorData.message || response.statusText}`,
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        if (signal?.aborted) {
          throw new Error("Request cancelled");
        }

        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes("4")) {
          throw error;
        }

        // Wait before retry (except on last attempt)

        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError!;
  }

  /**

   * Build API URL with parameters
   */
  private buildUrl(
    endpoint: string,
    params: Record<string, string | number>,
  ): string {
    const baseUrl = this.config.baseUrl || DEFAULT_CONFIG.baseUrl;
    const url = new URL(`${baseUrl}/${endpoint}`);

    // Add API key
    url.searchParams.set("appid", this.config.apiKey);

    // Add default parameters
    if (this.config.units) {
      url.searchParams.set("units", this.config.units);
    }
    if (this.config.language) {
      url.searchParams.set("lang", this.config.language);
    }

    // Add custom parameters

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });

    return url.toString();
  }

  /**
   * Transform OpenWeather current weather response to our WeatherData type
   */
  private transformCurrentWeather(
    data: OpenWeatherCurrentResponse,
  ): WeatherData {
    const weather = data.weather?.[0];

    if (!weather) {
      throw new Error("Invalid weather data: missing weather information");
    }

    const result: WeatherData = {
      dt: data.dt,
      temperature: data.main.temp,

      condition: weather.description,
      humidity: data.main.humidity,

      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
    };

    // Add optional properties only if they exist
    if (data.main.feels_like !== undefined)
      result.feelsLike = data.main.feels_like;
    if (weather.icon) result.icon = weather.icon;
    if (data.wind.deg !== undefined) result.windDirection = data.wind.deg;
    if (data.wind.gust !== undefined) result.windGust = data.wind.gust;
    if (data.visibility !== undefined)
      result.visibility = data.visibility / 1000;
    if (data.clouds?.all !== undefined) result.cloudCover = data.clouds.all;
    if (data.sys?.sunrise !== undefined) result.sunrise = data.sys.sunrise;
    if (data.sys?.sunset !== undefined) result.sunset = data.sys.sunset;

    const precipitation = (data.rain?.["1h"] || 0) + (data.snow?.["1h"] || 0);
    if (precipitation > 0) result.precipitation = precipitation;

    return result;
  }

  /**
   * Transform OpenWeather forecast item to our ForecastData type
   */
  private transformForecastItem(
    item: OpenWeatherForecastResponse["list"][0],
  ): ForecastData {
    const weather = item.weather?.[0];

    if (!weather) {
      throw new Error("Invalid forecast data: missing weather information");
    }

    const result: ForecastData = {
      dt: item.dt,
      temperature: item.main.temp,
      condition: weather.description,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      cloudCover: item.clouds.all,
      pressure: item.main.pressure,
    };

    // Add optional properties only if they exist
    if (weather.icon) result.icon = weather.icon;
    if (item.pop !== undefined) result.precipitation = item.pop * 100;
    if (item.wind.deg !== undefined) result.windDirection = item.wind.deg;
    if (item.visibility !== undefined)
      result.visibility = item.visibility / 1000;

    const precipitationAmount =
      (item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0);
    if (precipitationAmount > 0)
      result.precipitationAmount = precipitationAmount;

    return result;
  }

  /**
   * Get current weather by coordinates
   */
  async getCurrentWeather(
    coordinates: Coordinates,
    signal?: AbortSignal,
  ): Promise<WeatherData> {
    const cacheKey = `current-${coordinates.lat}-${coordinates.lon}`;

    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const url = this.buildUrl("2.5/weather", {
          lat: coordinates.lat,

          lon: coordinates.lon,
        });

        const data = await this.makeRequest<OpenWeatherCurrentResponse>(
          url,
          signal,
        );
        return this.transformCurrentWeather(data);
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Get current weather by city ID
   */

  async getCurrentWeatherById(
    cityId: string,
    signal?: AbortSignal,
  ): Promise<WeatherData> {
    const cacheKey = `current-id-${cityId}`;

    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const url = this.buildUrl("2.5/weather", { id: cityId });
        const data = await this.makeRequest<OpenWeatherCurrentResponse>(
          url,
          signal,
        );
        return this.transformCurrentWeather(data);
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Get 5-day forecast by coordinates

   */
  async getForecast(
    coordinates: Coordinates,
    signal?: AbortSignal,
  ): Promise<ForecastData[]> {
    const cacheKey = `forecast-${coordinates.lat}-${coordinates.lon}`;

    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const url = this.buildUrl("2.5/forecast", {
          lat: coordinates.lat,
          lon: coordinates.lon,
        });

        const data = await this.makeRequest<OpenWeatherForecastResponse>(
          url,
          signal,
        );
        return data.list.map((item) => this.transformForecastItem(item));
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Get One Call API data (current + forecast + historical)
   */
  async getOneCallData(
    coordinates: Coordinates,
    exclude: string[] = [],
    signal?: AbortSignal,
  ): Promise<{
    current: WeatherData;
    hourly: ForecastData[];
    daily: ForecastData[];
  }> {
    const cacheKey = `onecall-${coordinates.lat}-${coordinates.lon}-${exclude.join(",")}`;

    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const url = this.buildUrl(`${this.config.oneCallVersion}/onecall`, {
          lat: coordinates.lat,
          lon: coordinates.lon,
          exclude: exclude.join(","),
        });

        const data = await this.makeRequest<OpenWeatherOneCallResponse>(
          url,
          signal,
        );

        return {
          current: this.transformOneCallCurrent(data.current),
          hourly: data.hourly.map((item) => this.transformOneCallHourly(item)),
          daily: data.daily.map((item) => this.transformOneCallDaily(item)),
        };
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Transform One Call current weather data
   */

  private transformOneCallCurrent(
    current: OpenWeatherOneCallResponse["current"],
  ): WeatherData {
    const weather = current.weather?.[0];

    if (!weather) {
      throw new Error("Invalid One Call data: missing weather information");
    }

    const result: WeatherData = {
      dt: current.dt,
      temperature: current.temp,
      condition: weather.description,
      humidity: current.humidity,
      pressure: current.pressure,
      windSpeed: current.wind_speed,
    };

    // Add optional properties only if they exist
    if (current.feels_like !== undefined) result.feelsLike = current.feels_like;
    if (weather.icon) result.icon = weather.icon;
    if (current.wind_deg !== undefined) result.windDirection = current.wind_deg;
    if (current.wind_gust !== undefined) result.windGust = current.wind_gust;
    if (current.visibility !== undefined)
      result.visibility = current.visibility / 1000;
    if (current.uvi !== undefined) result.uvIndex = current.uvi;

    if (current.clouds !== undefined) result.cloudCover = current.clouds;
    if (current.dew_point !== undefined) result.dewPoint = current.dew_point;
    if (current.sunrise !== undefined) result.sunrise = current.sunrise;
    if (current.sunset !== undefined) result.sunset = current.sunset;

    const precipitation =
      (current.rain?.["1h"] || 0) + (current.snow?.["1h"] || 0);
    if (precipitation > 0) result.precipitation = precipitation;

    return result;
  }

  /**
   * Transform One Call hourly data
   */
  private transformOneCallHourly(
    item: OpenWeatherOneCallResponse["hourly"][0],
  ): ForecastData {
    const weather = item.weather?.[0];

    if (!weather) {
      throw new Error("Invalid hourly data: missing weather information");
    }

    const result: ForecastData = {
      dt: item.dt,
      temperature: item.temp,
      condition: weather.description,
      humidity: item.humidity,
      windSpeed: item.wind_speed,
      cloudCover: item.clouds,
      pressure: item.pressure,
    };

    // Add optional properties only if they exist
    if (weather.icon) result.icon = weather.icon;
    if (item.feels_like !== undefined) result.feelsLike = item.feels_like;
    if (item.pop !== undefined) result.precipitation = item.pop * 100;
    if (item.wind_deg !== undefined) result.windDirection = item.wind_deg;
    if (item.uvi !== undefined) result.uvIndex = item.uvi;
    if (item.visibility !== undefined)
      result.visibility = item.visibility / 1000;

    const precipitationAmount =
      (item.rain?.["1h"] || 0) + (item.snow?.["1h"] || 0);
    if (precipitationAmount > 0)
      result.precipitationAmount = precipitationAmount;

    return result;
  }

  /**

   * Transform One Call daily data
   */
  private transformOneCallDaily(
    item: OpenWeatherOneCallResponse["daily"][0],
  ): ForecastData {
    const weather = item.weather?.[0];

    if (!weather) {
      throw new Error("Invalid daily data: missing weather information");
    }

    const result: ForecastData = {
      dt: item.dt,
      temperature: item.temp.day,
      condition: weather.description,
      humidity: item.humidity,
      windSpeed: item.wind_speed,
      cloudCover: item.clouds,
      pressure: item.pressure,
    };

    // Add optional properties only if they exist
    if (weather.icon) result.icon = weather.icon;

    if (item.temp.min !== undefined) result.minTemp = item.temp.min;
    if (item.temp.max !== undefined) result.maxTemp = item.temp.max;
    if (item.pop !== undefined) result.precipitation = item.pop * 100;

    if (item.wind_deg !== undefined) result.windDirection = item.wind_deg;
    if (item.uvi !== undefined) result.uvIndex = item.uvi;

    const precipitationAmount = (item.rain || 0) + (item.snow || 0);
    if (precipitationAmount > 0)
      result.precipitationAmount = precipitationAmount;

    return result;
  }

  /**
   * Clear request queue (useful for cleanup)
   */
  clearQueue(): void {
    this.requestQueue.clear();
  }

  /**

   * Get API usage statistics
   */
  getUsageStats(): {
    requestCount: number;

    lastRequestTime: number;
    queueSize: number;
  } {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      queueSize: this.requestQueue.size,
    };
  }
}

/**
 * Create OpenWeather API service instance
 */
export function createOpenWeatherApiService(
  config: OpenWeatherConfig,
): OpenWeatherApiService {
  return new OpenWeatherApiService(config);
}

/**
 * Default OpenWeather API service instance

 */
export const openWeatherApi = createOpenWeatherApiService({
  provider: "openweathermap",
  apiKey:
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
    process.env.OPENWEATHER_API_KEY ||
    "",
});

/**
 * Export types for external use
 */
export type {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherOneCallResponse,
};
