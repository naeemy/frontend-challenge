/**
 * Core weather data structure
 */
export interface WeatherData {
  /** Unix timestamp of the weather observation */
  dt: number;

  /** Current temperature */

  temperature: number;

  /** Perceived temperature */
  feelsLike?: number;

  /** Weather condition description */
  condition: string;

  /** Weather icon code */
  icon?: string;

  /** Humidity percentage (0-100) */
  humidity: number;

  /** Atmospheric pressure in hPa */
  pressure: number;

  /** Wind speed */
  windSpeed: number;

  /** Wind direction in degrees (0-360) */
  windDirection?: number;

  /** Wind gust speed */

  windGust?: number;

  /** Visibility in km */
  visibility?: number;

  /** UV Index (0-11+) */
  uvIndex?: number;

  /** Cloud coverage percentage (0-100) */
  cloudCover?: number;

  /** Dew point temperature */
  dewPoint?: number;

  /** Precipitation amount */
  precipitation?: number;

  /** Precipitation probability (0-100) */
  precipitationProbability?: number;

  /** Sunrise timestamp */
  sunrise?: number;

  /** Sunset timestamp */
  sunset?: number;

  /** Air quality index */
  airQuality?: number;

  /** Additional weather details */
  details?: WeatherDetails;
}

/**

 * Extended weather details

 */
export interface WeatherDetails {
  /** Weather alerts */
  alerts?: WeatherAlert[];

  /** Weather warnings */
  warnings?: WeatherWarning[];

  /** Moon phase information */
  moonPhase?: MoonPhase;

  /** Seasonal information */
  season?: Season;

  /** Weather trends */
  trends?: WeatherTrends;

  /** Air quality breakdown */
  airQualityDetails?: AirQualityDetails;
}

/**
 * Weather alert information
 */
export interface WeatherAlert {
  /** Alert ID */
  id: string;

  /** Alert type */
  type: WeatherAlertType;

  /** Alert severity */
  severity: AlertSeverity;

  /** Alert title */
  title: string;

  /** Alert description */
  description: string;

  /** Start time */
  start: number;

  /** End time */
  end: number;

  /** Affected areas */

  areas?: string[];

  /** Source of the alert */
  source?: string;

  /** Instructions or recommendations */
  instructions?: string;
}

/**
 * Weather warning types
 */
export interface WeatherWarning {
  type: WeatherWarningType;
  message: string;
  severity: "low" | "medium" | "high";
  isActive: boolean;
}

/**
 * Moon phase information
 */
export interface MoonPhase {
  /** Phase name */
  phase: MoonPhaseName;

  /** Illumination percentage (0-100) */
  illumination: number;

  /** Moonrise timestamp */
  moonrise?: number;

  /** Moonset timestamp */
  moonset?: number;

  /** Days until next full moon */
  daysToFullMoon?: number;
}

/**
 * Seasonal information
 */
export interface Season {
  /** Current season */
  current: SeasonName;

  /** Days until next season */
  daysToNext?: number;

  /** Season-specific weather patterns */

  patterns?: string[];
}

/**
 * Weather trends

 */
export interface WeatherTrends {
  /** Temperature trend */
  temperature: TrendDirection;

  /** Pressure trend */
  pressure: TrendDirection;

  /** Humidity trend */
  humidity: TrendDirection;

  /** Wind trend */
  wind: TrendDirection;

  /** Overall weather trend */
  overall: WeatherTrendType;
}

/**
 * Air quality details
 */

export interface AirQualityDetails {
  /** Overall AQI */
  aqi: number;

  /** AQI category */
  category: AirQualityCategory;

  /** Individual pollutant levels */
  pollutants: {
    pm25?: number; // PM2.5
    pm10?: number; // PM10
    o3?: number; // Ozone

    no2?: number; // Nitrogen Dioxide
    so2?: number; // Sulfur Dioxide
    co?: number; // Carbon Monoxide
  };

  /** Health recommendations */
  healthRecommendations?: string[];

  /** Dominant pollutant */
  dominantPollutant?: string;
}

/**
 * Weather condition categories
 */

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "overcast"
  | "fog"
  | "mist"
  | "drizzle"
  | "light-rain"
  | "rain"
  | "heavy-rain"
  | "thunderstorm"
  | "snow"
  | "light-snow"
  | "heavy-snow"
  | "sleet"
  | "hail"
  | "blizzard"
  | "sandstorm"
  | "tornado"
  | "hurricane";

/**
 * Weather alert types
 */
export type WeatherAlertType =
  | "tornado"
  | "thunderstorm"
  | "flood"
  | "hurricane"
  | "winter-storm"
  | "ice-storm"
  | "heat-wave"
  | "cold-wave"
  | "high-wind"
  | "fire-weather"
  | "air-quality"
  | "coastal-flood"
  | "avalanche"
  | "dust-storm";

/**
 * Weather warning types
 */
export type WeatherWarningType =
  | "extreme-temperature"
  | "poor-visibility"
  | "strong-winds"
  | "heavy-precipitation"
  | "lightning"
  | "uv-warning"
  | "air-quality-warning";

/**
 * Alert severity levels
 */
export type AlertSeverity = "minor" | "moderate" | "severe" | "extreme";

/**
 * Moon phases
 */
export type MoonPhaseName =
  | "new-moon"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full-moon"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

/**
 * Seasons

 */
export type SeasonName = "spring" | "summer" | "autumn" | "winter";

/**
 * Trend directions
 */
export type TrendDirection = "rising" | "falling" | "stable";

/**
 * Weather trend types
 */
export type WeatherTrendType = "improving" | "deteriorating" | "stable";

/**
 * Air quality categories
 */
export type AirQualityCategory =
  | "good"
  | "moderate"
  | "unhealthy-for-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

/**
 * Weather data source information
 */

export interface WeatherDataSource {
  /** Provider name */

  provider: WeatherProvider;

  /** API version */
  version?: string;

  /** Data timestamp */
  timestamp: number;

  /** Data reliability score */
  reliability?: number;

  /** Update frequency in minutes */
  updateFrequency?: number;
}

/**
 * Weather service providers
 */
export type WeatherProvider =
  | "openweathermap"
  | "weatherapi"
  | "accuweather"
  | "darksky"
  | "weather-underground"
  | "national-weather-service"
  | "met-office"
  | "environment-canada";

/**

 * Weather API configuration
 */
export interface WeatherApiConfig {
  /** Provider type */
  provider: WeatherProvider;

  /** API key */
  apiKey: string;

  /** Base URL */
  baseUrl?: string;

  /** Default units */

  units?: WeatherUnits;

  /** Default language */
  language?: string;

  /** Request timeout */
  timeout?: number;

  /** Rate limiting */
  rateLimit?: {
    requests: number;
    window: number;
  };

  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Weather units system
 */
export interface WeatherUnits {
  /** Temperature unit */
  temperature: "celsius" | "fahrenheit" | "kelvin";

  /** Speed unit */
  speed: "kmh" | "mph" | "ms" | "knots";

  /** Distance unit */
  distance: "km" | "mi" | "m" | "ft";

  /** Pressure unit */
  pressure: "hpa" | "inhg" | "mb" | "mmhg";

  /** Precipitation unit */
  precipitation: "mm" | "in" | "cm";
}

/**
 * Weather cache entry
 */
export interface WeatherCacheEntry {
  /** Cached data */
  data: WeatherData;

  /** Cache timestamp */
  cachedAt: number;

  /** Expiry timestamp */
  expiresAt: number;

  /** Data source */
  source: WeatherDataSource;

  /** Cache key */
  key: string;
}

/**
 * Weather comparison data
 */
export interface WeatherComparison {
  /** Base weather data */
  base: WeatherData;

  /** Comparison weather data */
  comparison: WeatherData;

  /** Differences */
  differences: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
  };

  /** Comparison type */

  type: "historical" | "forecast" | "location";
}

/**
 * Weather statistics
 */
export interface WeatherStatistics {
  /** Average temperature */
  avgTemperature: number;

  /** Min/max temperatures */

  minTemperature: number;
  maxTemperature: number;

  /** Average humidity */
  avgHumidity: number;

  /** Total precipitation */
  totalPrecipitation: number;

  /** Most common weather condition */
  dominantCondition: WeatherCondition;

  /** Number of data points */
  dataPoints: number;

  /** Time range */
  timeRange: {
    start: number;
    end: number;
  };
}
