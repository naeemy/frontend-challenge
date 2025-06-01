/**
 * Temperature unit preferences
 */
export type TemperatureUnit = "celsius" | "fahrenheit";

/**
 * Distance/speed unit preferences
 */
export type DistanceUnit = "metric" | "imperial";

/**
 * Time format preferences
 */
export type TimeFormat = "12h" | "24h";

/**
 * Date format preferences
 */
export type DateFormat = "mdy" | "dmy" | "ymd" | "iso";

/**
 * Language/locale preferences
 */

export type LanguageCode =
  | "en" // English
  | "es" // Spanish
  | "fr" // French
  | "de" // German
  | "it" // Italian
  | "pt" // Portuguese
  | "ru" // Russian
  | "zh" // Chinese
  | "ja" // Japanese
  | "ko" // Korean
  | "ar" // Arabic
  | "hi"; // Hindi

/**
 * Theme preferences
 */
export type ThemeMode = "light" | "dark" | "auto";

/**

 * Color scheme options
 */
export type ColorScheme =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "pink"
  | "indigo"
  | "teal";

/**
 * App layout preferences
 */
export type LayoutPreference = "grid" | "list" | "compact";

/**
 * Data refresh preferences
 */
export interface RefreshSettings {
  /** Enable automatic refresh */
  autoRefresh: boolean;

  /** Refresh interval in minutes */
  interval: number;

  /** Refresh when app becomes active */
  onAppFocus: boolean;

  /** Background refresh */
  backgroundRefresh: boolean;

  /** WiFi only refresh */
  wifiOnly: boolean;
}

/**
 * Notification preferences
 */
export interface NotificationSettings {
  /** Enable notifications */
  enabled: boolean;

  /** Weather alerts */
  weatherAlerts: boolean;

  /** Daily weather summary */
  dailySummary: boolean;

  /** Severe weather warnings */
  severeWeather: boolean;

  /** Temperature threshold alerts */

  temperatureAlerts: {
    enabled: boolean;
    highThreshold?: number;
    lowThreshold?: number;
  };

  /** Precipitation alerts */
  precipitationAlerts: boolean;

  /** Air quality alerts */
  airQualityAlerts: boolean;

  /** Notification time preferences */
  timing: {
    dailySummaryTime: string; // HH:MM format
    alertsQuietHours: {
      enabled: boolean;
      start: string; // HH:MM
      end: string; // HH:MM
    };
  };

  /** Notification delivery */
  delivery: {
    push: boolean;
    email?: boolean;
    sound: boolean;

    vibration: boolean;
  };
}

/**
 * Privacy and data preferences
 */
export interface PrivacySettings {
  /** Location tracking */
  locationTracking: boolean;

  /** Anonymous usage analytics */
  analytics: boolean;

  /** Crash reporting */
  crashReporting: boolean;

  /** Data sharing with weather services */
  dataSharing: boolean;

  /** Cache weather data locally */
  localCache: boolean;

  /** Offline mode preferences */
  offlineMode: {
    enabled: boolean;
    cacheSize: number; // in MB
    cacheDuration: number; // in days
  };
}

/**
 * Accessibility preferences
 */
export interface AccessibilitySettings {
  /** High contrast mode */

  highContrast: boolean;

  /** Large text */
  largeText: boolean;

  /** Reduced motion */
  reducedMotion: boolean;

  /** Screen reader support */
  screenReader: boolean;

  /** Color blind friendly mode */

  colorBlindFriendly: boolean;

  /** Voice announcements */
  voiceAnnouncements: boolean;

  /** Keyboard navigation */
  keyboardNavigation: boolean;
}

/**
 * Display preferences
 */
export interface DisplaySettings {
  /** Theme mode */
  theme: ThemeMode;

  /** Color scheme */
  colorScheme: ColorScheme;

  /** Default layout */
  defaultLayout: LayoutPreference;

  /** Show weather backgrounds */
  weatherBackgrounds: boolean;

  /** Animated weather icons */
  animatedIcons: boolean;

  /** Show detailed metrics */
  showDetailedMetrics: boolean;

  /** Compact view options */
  compactView: {
    hideMetrics: boolean;
    smallerCards: boolean;
    denseLayout: boolean;
  };

  /** City list preferences */
  cityList: {
    showTime: boolean;
    showCoordinates: boolean;
    showPopulation: boolean;
    sortBy: CitySort;
  };
}

/**
 * City sorting options
 */

export type CitySort =
  | "name"
  | "country"
  | "temperature"
  | "added"
  | "alphabetical"
  | "custom";

/**
 * Weather data preferences
 */
export interface WeatherDataSettings {
  /** Default forecast range */
  defaultForecastRange: "24h" | "48h" | "7d" | "14d";

  /** Show feels-like temperature */
  showFeelsLike: boolean;

  /** Show hourly forecast */
  showHourlyForecast: boolean;

  /** Show weather maps */
  showWeatherMaps: boolean;

  /** Preferred weather data source */
  preferredSource?: string;

  /** Data quality preferences */
  dataQuality: {
    requireHighAccuracy: boolean;
    fallbackSources: string[];

    maxDataAge: number; // in minutes
  };

  /** Alert preferences */
  alerts: {
    showMinor: boolean;
    showModerate: boolean;

    showSevere: boolean;
    showExtreme: boolean;
    customThresholds: WeatherThresholds;
  };
}

/**
 * Custom weather alert thresholds
 */
export interface WeatherThresholds {
  /** Temperature thresholds */
  temperature: {
    hot: number;
    cold: number;

    extreme: number;
  };

  /** Wind speed thresholds */

  windSpeed: {
    high: number;
    extreme: number;
  };

  /** Precipitation thresholds */
  precipitation: {
    heavy: number;
    extreme: number;
  };

  /** Air quality thresholds */
  airQuality: {
    unhealthy: number;
    hazardous: number;
  };
}

/**
 * User profile and account settings
 */
export interface ProfileSettings {
  /** User identifier */
  userId?: string;

  /** Display name */
  displayName?: string;

  /** Email address */
  email?: string;

  /** Profile picture URL */
  avatar?: string;

  /** Home location */
  homeLocation?: {
    cityId: string;
    name: string;
    coordinates: { lat: number; lon: number };
  };

  /** Account preferences */
  account: {
    syncAcrossDevices: boolean;
    backupSettings: boolean;
    shareData: boolean;
  };
}

/**
 * App behavior settings
 */
export interface AppSettings {
  /** App language */
  language: LanguageCode;

  /** First day of week */
  firstDayOfWeek: "sunday" | "monday";

  /** Startup behavior */
  startup: {
    openToHome: boolean;
    checkForUpdates: boolean;
    showTip: boolean;
  };

  /** Performance settings */
  performance: {
    enableAnimations: boolean;
    preloadData: boolean;
    cacheImages: boolean;
    lowDataMode: boolean;
  };

  /** Debug settings */
  debug: {
    enableLogging: boolean;
    showDebugInfo: boolean;
    betaFeatures: boolean;
  };
}

/**
 * Complete user settings object
 */
export interface UserSettings {
  /** Temperature and units */
  units: {
    temperature: TemperatureUnit;
    distance: DistanceUnit;
    time: TimeFormat;
    date: DateFormat;
  };

  /** Data refresh settings */
  refresh: RefreshSettings;

  /** Notification preferences */
  notifications: NotificationSettings;

  /** Privacy settings */
  privacy: PrivacySettings;

  /** Accessibility settings */
  accessibility: AccessibilitySettings;

  /** Display preferences */
  display: DisplaySettings;

  /** Weather data preferences */
  weather: WeatherDataSettings;

  /** User profile */

  profile: ProfileSettings;

  /** App behavior */
  app: AppSettings;

  /** Settings metadata */
  metadata: SettingsMetadata;
}

/**
 * Settings metadata
 */
export interface SettingsMetadata {
  /** Settings version */
  version: string;

  /** Last updated timestamp */
  lastUpdated: number;

  /** Device/platform info */
  platform?: string;

  /** Migration history */
  migrations?: string[];

  /** Settings sync status */

  syncStatus?: {
    lastSync: number;

    syncEnabled: boolean;
    conflicts?: string[];
  };
}

/**
 * Settings import/export structure
 */

export interface SettingsExport {
  /** Export metadata */
  metadata: {
    exportedAt: number;
    version: string;
    source: string;
  };

  /** Settings data */
  settings: UserSettings;

  /** User cities */
  cities?: Array<{
    id: string;
    name: string;
    country: string;
    coordinates: { lat: number; lon: number };
  }>;

  /** Checksum for integrity */
  checksum: string;
}

/**
 * Settings validation result
 */
export interface SettingsValidation {
  /** Is valid */
  isValid: boolean;

  /** Validation errors */
  errors: string[];

  /** Warnings */
  warnings: string[];

  /** Suggested fixes */
  fixes?: Array<{
    path: string;
    issue: string;
    suggestedValue: any;
  }>;
}

/**
 * Settings migration info
 */
export interface SettingsMigration {
  /** From version */
  fromVersion: string;

  /** To version */
  toVersion: string;

  /** Migration steps */
  steps: Array<{
    description: string;
    path: string;
    action: "add" | "remove" | "rename" | "transform";
    oldValue?: any;
    newValue?: any;
  }>;

  /** Backup created */
  backupCreated: boolean;
}

/**

 * Default settings factory

 */
export interface DefaultSettings {
  /** Get default settings */
  getDefaults(): UserSettings;

  /** Get defaults for specific section */
  getDefaultsFor<K extends keyof UserSettings>(section: K): UserSettings[K];

  /** Merge with defaults */
  mergeWithDefaults(partial: Partial<UserSettings>): UserSettings;

  /** Validate settings */
  validate(settings: Partial<UserSettings>): SettingsValidation;
}
