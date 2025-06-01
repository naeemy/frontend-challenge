import type { WeatherCondition } from "@/types";

/**
 * Weather icon configuration
 */
export interface WeatherIconConfig {
  provider: "openweather" | "weatherapi" | "custom";
  baseUrl?: string;
  size?: "small" | "medium" | "large" | "2x" | "4x";
  format?: "png" | "svg";
  theme?: "default" | "filled" | "outline";
}

/**
 * Weather icon information
 */
export interface WeatherIconInfo {
  url: string;
  alt: string;
  description: string;
  condition: WeatherCondition;
  isDay: boolean;
  provider: string;
  fallbackIcon?: string;
}

/**
 * OpenWeather icon mapping
 */
const OPENWEATHER_ICON_MAP: Record<
  string,
  {
    condition: WeatherCondition;
    description: string;
    isDay: boolean;
  }
> = {
  // Clear sky
  "01d": { condition: "clear", description: "Clear sky (day)", isDay: true },
  "01n": { condition: "clear", description: "Clear sky (night)", isDay: false },

  // Few clouds
  "02d": {
    condition: "partly-cloudy",
    description: "Few clouds (day)",
    isDay: true,
  },
  "02n": {
    condition: "partly-cloudy",
    description: "Few clouds (night)",
    isDay: false,
  },

  // Scattered clouds
  "03d": {
    condition: "cloudy",
    description: "Scattered clouds (day)",
    isDay: true,
  },
  "03n": {
    condition: "cloudy",
    description: "Scattered clouds (night)",
    isDay: false,
  },

  // Broken clouds
  "04d": {
    condition: "overcast",
    description: "Broken clouds (day)",
    isDay: true,
  },

  "04n": {
    condition: "overcast",
    description: "Broken clouds (night)",
    isDay: false,
  },

  // Shower rain
  "09d": { condition: "rain", description: "Shower rain (day)", isDay: true },

  "09n": {
    condition: "rain",
    description: "Shower rain (night)",
    isDay: false,
  },

  // Rain
  "10d": { condition: "light-rain", description: "Rain (day)", isDay: true },
  "10n": { condition: "light-rain", description: "Rain (night)", isDay: false },

  // Thunderstorm
  "11d": {
    condition: "thunderstorm",
    description: "Thunderstorm (day)",
    isDay: true,
  },
  "11n": {
    condition: "thunderstorm",
    description: "Thunderstorm (night)",
    isDay: false,
  },

  // Snow
  "13d": { condition: "snow", description: "Snow (day)", isDay: true },
  "13n": { condition: "snow", description: "Snow (night)", isDay: false },

  // Mist/Fog
  "50d": { condition: "fog", description: "Mist (day)", isDay: true },
  "50n": { condition: "fog", description: "Mist (night)", isDay: false },
};

/**
 * Weather condition to icon mapping for custom icons
 */
const CONDITION_ICON_MAP: Record<
  WeatherCondition,
  {
    dayIcon: string;
    nightIcon: string;
    description: string;
  }
> = {
  clear: {
    dayIcon: "sun",
    nightIcon: "moon",

    description: "Clear sky",
  },
  "partly-cloudy": {
    dayIcon: "cloud-sun",

    nightIcon: "cloud-moon",
    description: "Partly cloudy",
  },
  cloudy: {
    dayIcon: "cloud",
    nightIcon: "cloud",
    description: "Cloudy",
  },
  overcast: {
    dayIcon: "clouds",
    nightIcon: "clouds",
    description: "Overcast",
  },

  fog: {
    dayIcon: "fog",
    nightIcon: "fog",
    description: "Foggy",
  },
  mist: {
    dayIcon: "mist",
    nightIcon: "mist",
    description: "Misty",
  },
  drizzle: {
    dayIcon: "drizzle",
    nightIcon: "drizzle",
    description: "Drizzle",
  },
  "light-rain": {
    dayIcon: "rain-light",
    nightIcon: "rain-light",
    description: "Light rain",
  },
  rain: {
    dayIcon: "rain",
    nightIcon: "rain",
    description: "Rain",
  },
  "heavy-rain": {
    dayIcon: "rain-heavy",
    nightIcon: "rain-heavy",
    description: "Heavy rain",
  },
  thunderstorm: {
    dayIcon: "thunderstorm",
    nightIcon: "thunderstorm",
    description: "Thunderstorm",
  },
  snow: {
    dayIcon: "snow",
    nightIcon: "snow",
    description: "Snow",
  },
  "light-snow": {
    dayIcon: "snow-light",

    nightIcon: "snow-light",
    description: "Light snow",
  },
  "heavy-snow": {
    dayIcon: "snow-heavy",

    nightIcon: "snow-heavy",
    description: "Heavy snow",
  },
  sleet: {
    dayIcon: "sleet",
    nightIcon: "sleet",
    description: "Sleet",
  },
  hail: {
    dayIcon: "hail",
    nightIcon: "hail",
    description: "Hail",
  },
  blizzard: {
    dayIcon: "blizzard",
    nightIcon: "blizzard",
    description: "Blizzard",
  },
  sandstorm: {
    dayIcon: "sandstorm",
    nightIcon: "sandstorm",
    description: "Sandstorm",
  },
  tornado: {
    dayIcon: "tornado",
    nightIcon: "tornado",

    description: "Tornado",
  },
  hurricane: {
    dayIcon: "hurricane",
    nightIcon: "hurricane",
    description: "Hurricane",
  },
};

/**
 * Default icon configuration
 */
const DEFAULT_CONFIG: WeatherIconConfig = {
  provider: "openweather",
  baseUrl: "https://openweathermap.org/img/wn",
  size: "medium",
  format: "png",
  theme: "default",
};

/**

 * Weather icon utilities class
 */
export class WeatherIconUtils {
  private config: WeatherIconConfig;

  constructor(config: Partial<WeatherIconConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get weather icon URL from OpenWeather icon code
   */
  getOpenWeatherIconUrl(iconCode: string, size: string = "2x"): string {
    const baseUrl = this.config.baseUrl || "https://openweathermap.org/img/wn";
    return `${baseUrl}/${iconCode}@${size}.png`;
  }

  /**
   * Get weather icon information from OpenWeather icon code
   */
  getOpenWeatherIconInfo(iconCode: string): WeatherIconInfo | null {
    const iconData = OPENWEATHER_ICON_MAP[iconCode];
    if (!iconData) {
      return null;
    }

    return {
      url: this.getOpenWeatherIconUrl(iconCode),
      alt: iconData.description,
      description: iconData.description,
      condition: iconData.condition,
      isDay: iconData.isDay,
      provider: "openweather",
      fallbackIcon: this.getFallbackIcon(iconData.condition, iconData.isDay),
    };
  }

  /**
   * Get weather icon from condition string
   */
  getIconFromCondition(
    condition: string,
    isDay: boolean = true,
    provider: "openweather" | "custom" = "custom",
  ): WeatherIconInfo {
    const normalizedCondition = this.normalizeCondition(condition);
    const mappedCondition = this.mapToWeatherCondition(normalizedCondition);

    if (provider === "openweather") {
      // Find corresponding OpenWeather icon
      const openWeatherIcon = this.findOpenWeatherIcon(mappedCondition, isDay);
      if (openWeatherIcon) {
        return this.getOpenWeatherIconInfo(openWeatherIcon)!;
      }
    }

    // Use custom icon mapping
    const iconMap = CONDITION_ICON_MAP[mappedCondition];
    const iconName = isDay ? iconMap.dayIcon : iconMap.nightIcon;

    return {
      url: this.getCustomIconUrl(iconName),
      alt: iconMap.description,

      description: iconMap.description,
      condition: mappedCondition,
      isDay,
      provider: "custom",
      fallbackIcon: this.getFallbackIcon(mappedCondition, isDay),
    };
  }

  /**

   * Get multiple icon sizes for responsive display

   */
  getResponsiveIcons(iconCode: string): {
    small: string;
    medium: string;

    large: string;
    sizes: string;
    srcSet: string;
  } {
    const baseUrl = this.config.baseUrl || "https://openweathermap.org/img/wn";

    return {
      small: `${baseUrl}/${iconCode}.png`,
      medium: `${baseUrl}/${iconCode}@2x.png`,
      large: `${baseUrl}/${iconCode}@4x.png`,
      sizes: "(max-width: 640px) 32px, (max-width: 1024px) 64px, 128px",
      srcSet: `${baseUrl}/${iconCode}.png 32w, ${baseUrl}/${iconCode}@2x.png 64w, ${baseUrl}/${iconCode}@4x.png 128w`,
    };
  }

  /**
   * Preload weather icons for better performance
   */
  preloadIcons(iconCodes: string[]): Promise<void[]> {
    const promises = iconCodes.map((iconCode) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error(`Failed to load icon: ${iconCode}`));
        img.src = this.getOpenWeatherIconUrl(iconCode);
      });
    });

    return Promise.all(promises);
  }

  /**
   * Get weather icon as SVG string for inline use
   */
  getWeatherIconSvg(
    condition: WeatherCondition,
    isDay: boolean = true,
    size: number = 24,
  ): string {
    const iconMap = CONDITION_ICON_MAP[condition];
    const iconName = isDay ? iconMap.dayIcon : iconMap.nightIcon;

    // Return SVG based on icon name
    return this.generateSvgIcon(iconName, size);
  }

  /**
   * Check if icon is available
   */
  async isIconAvailable(iconCode: string): Promise<boolean> {
    try {
      const response = await fetch(this.getOpenWeatherIconUrl(iconCode), {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get fallback icon for when primary icon fails to load
   */
  private getFallbackIcon(condition: WeatherCondition, isDay: boolean): string {
    // Simple fallback mapping
    const fallbacks: Record<WeatherCondition, string> = {
      clear: isDay ? "☀️" : "🌙",
      "partly-cloudy": isDay ? "⛅" : "☁️",
      cloudy: "☁️",
      overcast: "☁️",
      fog: "🌫️",
      mist: "🌫️",
      drizzle: "🌦️",
      "light-rain": "🌦️",
      rain: "🌧️",
      "heavy-rain": "🌧️",
      thunderstorm: "⛈️",
      snow: "🌨️",
      "light-snow": "🌨️",
      "heavy-snow": "❄️",

      sleet: "🌨️",
      hail: "🌨️",
      blizzard: "❄️",
      sandstorm: "🌪️",
      tornado: "🌪️",
      hurricane: "🌀",
    };

    return fallbacks[condition] || "☁️";
  }

  /**
   * Normalize condition string
   */
  private normalizeCondition(condition: string): string {
    return condition.toLowerCase().trim().replace(/\s+/g, " ");
  }

  /**
   * Map condition string to WeatherCondition enum
   */
  private mapToWeatherCondition(condition: string): WeatherCondition {
    // Clear conditions
    if (condition.includes("clear") || condition.includes("sunny"))
      return "clear";

    // Cloudy conditions
    if (condition.includes("few clouds") || condition.includes("partly"))
      return "partly-cloudy";
    if (condition.includes("scattered clouds") || condition.includes("cloudy"))
      return "cloudy";

    if (condition.includes("broken clouds") || condition.includes("overcast"))
      return "overcast";

    // Precipitation
    if (condition.includes("drizzle")) return "drizzle";

    if (condition.includes("light rain")) return "light-rain";
    if (condition.includes("heavy rain")) return "heavy-rain";

    if (condition.includes("rain") || condition.includes("shower"))
      return "rain";

    // Thunderstorms
    if (condition.includes("thunder") || condition.includes("storm"))
      return "thunderstorm";

    // Snow
    if (condition.includes("light snow")) return "light-snow";
    if (condition.includes("heavy snow")) return "heavy-snow";
    if (condition.includes("snow")) return "snow";
    if (condition.includes("sleet")) return "sleet";

    if (condition.includes("hail")) return "hail";

    if (condition.includes("blizzard")) return "blizzard";

    // Other conditions
    if (condition.includes("fog")) return "fog";

    if (condition.includes("mist")) return "mist";

    if (condition.includes("tornado")) return "tornado";
    if (condition.includes("hurricane")) return "hurricane";

    if (condition.includes("sand")) return "sandstorm";

    // Default fallback

    return "cloudy";
  }

  /**
   * Find corresponding OpenWeather icon code
   */
  private findOpenWeatherIcon(
    condition: WeatherCondition,
    isDay: boolean,
  ): string | null {
    for (const [iconCode, iconData] of Object.entries(OPENWEATHER_ICON_MAP)) {
      if (iconData.condition === condition && iconData.isDay === isDay) {
        return iconCode;
      }
    }
    return null;
  }

  /**

   * Get custom icon URL

   */
  private getCustomIconUrl(iconName: string): string {
    // This would point to your custom icon assets
    return `/icons/weather/${iconName}.svg`;
  }

  /**

   * Generate SVG icon
   */
  private generateSvgIcon(iconName: string, size: number): string {
    // This is a simplified implementation
    // In a real app, you'd have actual SVG definitions
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4" opacity="0.3"/>

      <text x="12" y="16" text-anchor="middle" font-size="12">${iconName}</text>
    </svg>`;
  }

  /**

   * Get weather condition from icon code
   */
  getConditionFromIcon(iconCode: string): WeatherCondition | null {
    const iconData = OPENWEATHER_ICON_MAP[iconCode];
    return iconData ? iconData.condition : null;
  }

  /**
   * Check if it's a day or night icon
   */
  isDayIcon(iconCode: string): boolean | null {
    const iconData = OPENWEATHER_ICON_MAP[iconCode];
    return iconData ? iconData.isDay : null;
  }

  /**

   * Get icon theme variants
   */
  getIconThemes(iconCode: string): {
    default: string;

    filled: string;
    outline: string;
  } {
    const baseUrl = this.getOpenWeatherIconUrl(iconCode);
    return {
      default: baseUrl,
      filled: baseUrl.replace(".png", "_filled.png"),
      outline: baseUrl.replace(".png", "_outline.png"),
    };
  }

  /**

   * Update configuration
   */
  updateConfig(config: Partial<WeatherIconConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Create weather icon utils instance
 */
export function createWeatherIconUtils(
  config?: Partial<WeatherIconConfig>,
): WeatherIconUtils {
  return new WeatherIconUtils(config);
}

/**
 * Default weather icon utils instance

 */
export const weatherIconUtils = createWeatherIconUtils();

/**
 * Utility functions for quick access
 */
export const getWeatherIconUrl = (
  iconCode: string,
  size: string = "2x",
): string => {
  return weatherIconUtils.getOpenWeatherIconUrl(iconCode, size);
};

export const getWeatherIconInfo = (
  iconCode: string,
): WeatherIconInfo | null => {
  return weatherIconUtils.getOpenWeatherIconInfo(iconCode);
};

export const getIconFromCondition = (
  condition: string,
  isDay: boolean = true,
): WeatherIconInfo => {
  return weatherIconUtils.getIconFromCondition(condition, isDay);
};

export const preloadWeatherIcons = (iconCodes: string[]): Promise<void[]> => {
  return weatherIconUtils.preloadIcons(iconCodes);
};
