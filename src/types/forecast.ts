import type { WeatherCondition, WeatherAlert } from "./weather";

/**
 * Basic forecast data point
 */
export interface ForecastData {
  /** Unix timestamp for this forecast */
  dt: number;

  /** Temperature for this time */
  temperature: number;

  /** Minimum temperature (for daily forecasts) */
  minTemp?: number;

  /** Maximum temperature (for daily forecasts) */
  maxTemp?: number;

  /** Feels like temperature */
  feelsLike?: number;

  /** Weather condition */
  condition: string;

  /** Weather icon code */

  icon?: string;

  /** Precipitation probability (0-100) */
  precipitation?: number;

  /** Precipitation amount */
  precipitationAmount?: number;

  /** Humidity percentage */
  humidity?: number;

  /** Wind speed */
  windSpeed?: number;

  /** Wind direction in degrees */
  windDirection?: number;

  /** Cloud coverage percentage */
  cloudCover?: number;

  /** UV Index */
  uvIndex?: number;

  /** Pressure */
  pressure?: number;

  /** Visibility */
  visibility?: number;
}

/**
 * Hourly forecast data
 */
export interface HourlyForecast extends ForecastData {
  /** Hour of the day (0-23) */
  hour: number;

  /** Is this the current hour */
  isCurrent?: boolean;

  /** Precipitation type */
  precipitationType?: PrecipitationType;

  /** Wind gust speed */
  windGust?: number;
}

/**
 * Daily forecast data
 */
export interface DailyForecast {
  /** Date timestamp (start of day) */
  date: number;

  /** Day of week */
  dayOfWeek: string;

  /** Minimum temperature */
  minTemp: number;

  /** Maximum temperature */
  maxTemp: number;

  /** Morning temperature */
  morningTemp?: number;

  /** Afternoon temperature */
  afternoonTemp?: number;

  /** Evening temperature */
  eveningTemp?: number;

  /** Night temperature */
  nightTemp?: number;

  /** Dominant weather condition */
  condition: string;

  /** Weather icon */
  icon?: string;

  /** Weather summary */
  summary?: string;

  /** Precipitation probability */
  precipitation: number;

  /** Precipitation amount */
  precipitationAmount?: number;

  /** Humidity range */
  humidity: {
    min: number;
    max: number;
    avg: number;
  };

  /** Wind information */
  wind: {
    speed: number;
    direction?: number;
    gust?: number;
  };

  /** UV Index */
  uvIndex?: number;

  /** Sunrise time */
  sunrise?: number;

  /** Sunset time */
  sunset?: number;

  /** Moon phase */
  moonPhase?: string;

  /** Hourly breakdown */
  hourly?: HourlyForecast[];
}

/**
 * Extended forecast (multi-day)
 */
export interface ExtendedForecast {
  /** Location identifier */
  locationId: string;

  /** Forecast generation time */
  generatedAt: number;

  /** Daily forecasts */
  daily: DailyForecast[];

  /** Hourly forecasts */
  hourly: HourlyForecast[];

  /** Forecast alerts */

  alerts?: WeatherAlert[];

  /** Forecast summary */
  summary?: ForecastSummary;

  /** Data source */
  source?: string;
}

/**
 * Forecast summary information
 */
export interface ForecastSummary {
  /** Overall trend */
  trend: ForecastTrend;

  /** Week summary */
  weekSummary?: string;

  /** Notable weather events */
  notableEvents?: NotableWeatherEvent[];

  /** Temperature overview */
  temperatureOverview: {
    trend: "warming" | "cooling" | "stable";
    avgHigh: number;
    avgLow: number;

    extremeHigh?: number;
    extremeLow?: number;
  };

  /** Precipitation overview */
  precipitationOverview: {
    totalDays: number;
    rainyDays: number;
    totalAmount: number;
    heaviestDay?: number;
  };
}

/**
 * Notable weather events in forecast
 */
export interface NotableWeatherEvent {
  /** Event type */
  type: WeatherEventType;

  /** Event date */
  date: number;

  /** Event description */

  description: string;

  /** Severity level */
  severity: "low" | "medium" | "high";

  /** Confidence level */
  confidence: number;
}

/**
 * Forecast comparison between periods
 */
export interface ForecastComparison {
  /** Period 1 (e.g., this week) */
  period1: {
    label: string;
    timeRange: { start: number; end: number };
    avgTemp: number;
    totalPrecipitation: number;
    dominantCondition: WeatherCondition;
  };

  /** Period 2 (e.g., next week) */
  period2: {
    label: string;

    timeRange: { start: number; end: number };
    avgTemp: number;
    totalPrecipitation: number;
    dominantCondition: WeatherCondition;
  };

  /** Differences */
  differences: {
    temperature: number;
    precipitation: number;
    conditionChange: string;
  };
}

/**
 * Forecast accuracy tracking
 */
export interface ForecastAccuracy {
  /** Forecast ID */
  forecastId: string;

  /** Predicted data */
  predicted: ForecastData;

  /** Actual observed data */
  actual: ForecastData;

  /** Accuracy scores */
  accuracy: {
    temperature: number; // 0-100
    precipitation: number; // 0-100
    condition: number; // 0-100
    overall: number; // 0-100
  };

  /** Error margins */
  errors: {
    temperatureError: number;
    precipitationError: number;
    conditionMatch: boolean;
  };
}

/**
 * Precipitation types
 */
export type PrecipitationType =
  | "rain"
  | "snow"
  | "sleet"
  | "freezing-rain"
  | "hail"
  | "drizzle"
  | "mixed";

/**

 * Forecast trends
 */
export type ForecastTrend =
  | "improving"
  | "deteriorating"
  | "stable"
  | "variable"
  | "seasonal";

/**
 * Weather event types for forecasts
 */
export type WeatherEventType =
  | "heat-wave"
  | "cold-snap"
  | "heavy-rain"
  | "drought"
  | "storm"
  | "snow-storm"
  | "temperature-swing"
  | "unusual-weather";

/**

 * Forecast time ranges
 */
export type ForecastRange =
  | "hourly-24h" // Next 24 hours
  | "hourly-48h" // Next 48 hours
  | "daily-7d" // Next 7 days
  | "daily-14d" // Next 14 days
  | "daily-30d" // Next 30 days
  | "seasonal"; // Seasonal outlook

/**
 * Forecast request parameters
 */
export interface ForecastRequest {
  /** Location coordinates or ID */
  location: string | { lat: number; lon: number };

  /** Forecast range */
  range: ForecastRange;

  /** Include hourly data */
  includeHourly?: boolean;

  /** Include alerts */
  includeAlerts?: boolean;

  /** Include extended details */

  includeDetails?: boolean;

  /** Units preference */
  units?: "metric" | "imperial";

  /** Language preference */
  language?: string;
}

/**
 * Forecast response metadata
 */
export interface ForecastMetadata {
  /** Request timestamp */
  requestedAt: number;

  /** Data timestamp */
  dataTimestamp: number;

  /** Forecast model */
  model?: string;

  /** Update frequency */
  updateFrequency: number;

  /** Next update time */
  nextUpdate?: number;

  /** Data reliability */
  reliability: number;

  /** Coverage area */
  coverage?: {
    radius: number;
    accuracy: "high" | "medium" | "low";
  };
}

/**
 * Historical forecast data
 */
export interface HistoricalForecast {
  /** Historical date */

  date: number;

  /** Forecast that was made */
  forecastMade: ForecastData;

  /** What actually happened */
  actualWeather: ForecastData;

  /** Days ahead this forecast was for */
  daysAhead: number;

  /** Accuracy score */
  accuracyScore: number;
}

/**
 * Forecast preferences
 */
export interface ForecastPreferences {
  /** Default forecast range */

  defaultRange: ForecastRange;

  /** Show probability information */
  showProbability: boolean;

  /** Show hourly details */
  showHourlyDetails: boolean;

  /** Show extended forecast */
  showExtended: boolean;

  /** Alert preferences */
  alerts: {
    enabled: boolean;
    severity: ForecastAlertSeverity[];
    types: WeatherEventType[];
  };

  /** Update preferences */
  updates: {
    autoRefresh: boolean;
    refreshInterval: number;
    backgroundUpdates: boolean;
  };
}

/**

 * Alert severity for preferences
 */
export type ForecastAlertSeverity = "low" | "medium" | "high" | "extreme";

/**
 * Seasonal forecast data
 */
export interface SeasonalForecast {
  /** Season identifier */
  season: string;

  /** Year */
  year: number;

  /** Temperature outlook */
  temperature: {
    trend: "above-normal" | "normal" | "below-normal";
    confidence: number;
  };

  /** Precipitation outlook */
  precipitation: {
    trend: "above-normal" | "normal" | "below-normal";
    confidence: number;
  };

  /** Notable patterns */
  patterns?: string[];

  /** Climate drivers */
  climateDrivers?: {
    elNino?: "strong" | "moderate" | "weak" | "neutral";
    laNina?: "strong" | "moderate" | "weak" | "neutral";
    other?: string[];
  };
}
