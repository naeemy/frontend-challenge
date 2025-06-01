// Export all types from individual modules

export * from "./location";
export * from "./settings";

// Export weather types with explicit re-exports to avoid conflicts
export type {
  WeatherData,
  WeatherDetails,
  WeatherAlert,
  WeatherWarning,
  MoonPhase,
  Season,
  WeatherTrends,
  AirQualityDetails,
  WeatherCondition,
  WeatherAlertType,
  WeatherWarningType,
  AlertSeverity,
  MoonPhaseName,
  SeasonName,
  TrendDirection,
  WeatherTrendType,
  AirQualityCategory,
  WeatherDataSource,
  WeatherProvider,
  WeatherApiConfig,
  WeatherUnits,
  WeatherCacheEntry,
  WeatherComparison,
  WeatherStatistics,
} from "./weather";

// Export forecast types with explicit re-exports to avoid conflicts
export type {
  ForecastData,
  HourlyForecast,
  DailyForecast,
  ExtendedForecast,
  ForecastSummary,
  NotableWeatherEvent,
  ForecastComparison,
  ForecastAccuracy,
  PrecipitationType,
  ForecastTrend,
  WeatherEventType,
  ForecastRange,
  ForecastRequest,
  ForecastMetadata,
  HistoricalForecast,
  ForecastPreferences,
  ForecastAlertSeverity,
  SeasonalForecast,
} from "./forecast";

// Common utility types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;

  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CacheEntry<T> {
  data: T;
  cachedAt: number;

  expiresAt: number;
  key: string;
}

export interface ErrorResponse {
  error: string;
  code?: string | number;

  details?: Record<string, any>;
  timestamp: number;
}

// Hook return types
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface AsyncActions {
  refetch: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

// Event types
export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

export interface WeatherEvent extends AppEvent {
  type: "weather_updated" | "weather_error" | "forecast_updated";
  cityId?: string;
}

export interface LocationEvent extends AppEvent {
  type: "location_changed" | "city_added" | "city_removed";
  city?: import("./location").City;
}

export interface SettingsEvent extends AppEvent {
  type: "settings_updated" | "theme_changed" | "units_changed";

  setting?: string;
  value?: any;
}

// Navigation types

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  active?: boolean;

  disabled?: boolean;
}

export interface Breadcrumb {
  label: string;
  path?: string;
  active?: boolean;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "select" | "toggle" | "number" | "email";
  value: any;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;

    pattern?: string;
    message?: string;
  };
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Component prop types

export interface BaseProps {
  className?: string;
  children?: React.ReactNode;

  id?: string;
  "data-testid"?: string;
}

export interface ComponentWithLoading extends BaseProps {
  isLoading?: boolean;
  loadingText?: string;
}

export interface ComponentWithError extends BaseProps {
  error?: string | null;
  onRetry?: () => void;
}

// Search types
export interface SearchOptions {
  query: string;

  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
  executionTime: number;
}

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  dismissed?: boolean;
  createdAt: number;
}

// Theme types
export interface ThemeConfig {
  mode: import("./settings").ThemeMode;
  colorScheme: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    body: string;
    heading: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type KeyOf<T> = keyof T;
export type ValueOf<T> = T[keyof T];

// Environment types
export interface Environment {
  NODE_ENV: "development" | "production" | "test";
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_OPENWEATHER_API_KEY: string;
  NEXT_PUBLIC_PLACES_API_KEY: string;
}

// Build information
export interface BuildInfo {
  version: string;
  buildTime: string;
  gitCommit: string;
  environment: string;
}

// Feature flags
export interface FeatureFlags {
  enableNotifications: boolean;
  enableMaps: boolean;
  enableAirQuality: boolean;
  enableRadar: boolean;
  enableSocialSharing: boolean;
  enableOfflineMode: boolean;
  enableBetaFeatures: boolean;
}
