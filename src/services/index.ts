// @ts-nocheck
// Export all services
export * from "./openWeatherApi";
export * from "./placesApi";
export * from "./weatherIconUtils";

// Re-export commonly used service instances
export { openWeatherApi, createOpenWeatherApiService } from "./openWeatherApi";

export { placesApi, createPlacesApiService } from "./placesApi";

export {
  weatherIconUtils,
  createWeatherIconUtils,
  getWeatherIconUrl,
  getWeatherIconInfo,
  getIconFromCondition,
  preloadWeatherIcons,
} from "./weatherIconUtils";

// Re-export types for external use
export type {
  OpenWeatherConfig,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherOneCallResponse,
} from "./openWeatherApi";

export type {
  PlacesConfig,
  PlacesTextSearchResponse,
  PlacesAutocompleteResponse,
  PlaceDetailsResponse,
} from "./placesApi";

export type { WeatherIconConfig, WeatherIconInfo } from "./weatherIconUtils";

/**

 * Service registry for dependency injection
 */

export interface ServiceRegistry {
  weatherApi: import("./openWeatherApi").OpenWeatherApiService;
  placesApi: import("./placesApi").PlacesApiService;
  iconUtils: import("./weatherIconUtils").WeatherIconUtils;
}

/**
 * Create service registry with custom configurations
 */

export function createServiceRegistry(config: {
  openWeatherApiKey: string;
  placesApiKey: string;
  iconConfig?: Partial<import("./weatherIconUtils").WeatherIconConfig>;
}): ServiceRegistry {
  return {
    weatherApi: createOpenWeatherApiService({
      provider: "openweathermap",
      apiKey: config.openWeatherApiKey,
    }),
    placesApi: createPlacesApiService({
      apiKey: config.placesApiKey,
    }),
    iconUtils: createWeatherIconUtils(config.iconConfig),
  };
}

/**

 * Default service registry

 */
export const services = createServiceRegistry({
  openWeatherApiKey:
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
    process.env.OPENWEATHER_API_KEY ||
    "",
  placesApiKey:
    process.env.NEXT_PUBLIC_PLACES_API_KEY || process.env.PLACES_API_KEY || "",
});

/**
 * Service health check utilities
 */
export class ServiceHealthChecker {
  constructor(private serviceRegistry: ServiceRegistry) {}

  /**
   * Check if all services are properly configured
   */
  async checkServiceHealth(): Promise<{
    healthy: boolean;
    services: {
      weatherApi: boolean;

      placesApi: boolean;
      iconUtils: boolean;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const serviceStatus = {
      weatherApi: false,
      placesApi: false,
      iconUtils: true, // Icon utils doesn't require API calls
    };

    // Check OpenWeather API
    try {
      await this.serviceRegistry.weatherApi.getCurrentWeather(
        { lat: 40.7128, lon: -74.006 }, // NYC coordinates for test
        new AbortController().signal,
      );
      serviceStatus.weatherApi = true;
    } catch (error) {
      errors.push(
        `OpenWeather API: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Check Places API
    try {
      await this.serviceRegistry.placesApi.searchCities("New York", {
        limit: 1,
      });
      serviceStatus.placesApi = true;
    } catch (error) {
      errors.push(
        `Places API: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return {
      healthy: Object.values(serviceStatus).every((status) => status),
      services: serviceStatus,
      errors,
    };
  }

  /**
   * Get service usage statistics
   */
  getUsageStats(): {
    weatherApi: ReturnType<
      import("./openWeatherApi").OpenWeatherApiService["getUsageStats"]
    >;
    placesApi: ReturnType<
      import("./placesApi").PlacesApiService["getUsageStats"]
    >;
  } {
    return {
      weatherApi: this.serviceRegistry.weatherApi.getUsageStats(),
      placesApi: this.serviceRegistry.placesApi.getUsageStats(),
    };
  }

  /**
   * Clear all service caches
   */
  clearAllCaches(): void {
    this.serviceRegistry.weatherApi.clearQueue();
    this.serviceRegistry.placesApi.clearQueue();
  }
}

/**

 * Default health checker instance
 */
export const serviceHealthChecker = new ServiceHealthChecker(services);

/**
 * Utility functions for service management
 */

export const serviceUtils = {
  /**
   * Check if API keys are configured
   */
  areApiKeysConfigured(): {
    openWeather: boolean;
    places: boolean;
    allConfigured: boolean;
  } {
    const openWeatherKey =
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
      process.env.OPENWEATHER_API_KEY;
    const placesKey =
      process.env.NEXT_PUBLIC_PLACES_API_KEY || process.env.PLACES_API_KEY;

    return {
      openWeather: Boolean(openWeatherKey),
      places: Boolean(placesKey),
      allConfigured: Boolean(openWeatherKey && placesKey),
    };
  },

  /**
   * Get service configuration status
   */
  getConfigurationStatus(): {
    openWeatherApi: {
      configured: boolean;
      baseUrl: string;
      rateLimit: number;
    };
    placesApi: {
      configured: boolean;
      baseUrl: string;
      rateLimit: number;
    };
    iconUtils: {
      provider: string;
      baseUrl: string;
    };
  } {
    return {
      openWeatherApi: {
        configured: Boolean(
          process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
            process.env.OPENWEATHER_API_KEY,
        ),
        baseUrl: "https://api.openweathermap.org/data",
        rateLimit: 60, // requests per minute
      },
      placesApi: {
        configured: Boolean(
          process.env.NEXT_PUBLIC_PLACES_API_KEY || process.env.PLACES_API_KEY,
        ),
        baseUrl: "https://maps.googleapis.com/maps/api/place",
        rateLimit: 100, // requests per minute
      },
      iconUtils: {
        provider: "openweather",
        baseUrl: "https://openweathermap.org/img/wn",
      },
    };
  },

  /**
   * Test service connectivity
   */
  async testConnectivity(): Promise<{
    openWeather: boolean;
    places: boolean;
    icons: boolean;
  }> {
    const results = {
      openWeather: false,
      places: false,
      icons: false,
    };

    // Test OpenWeather API
    try {
      const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=London&appid=test",
        {
          method: "HEAD",
        },
      );
      results.openWeather = response.status !== 0; // Any response means connectivity
    } catch {
      // Network error
    }

    // Test Places API
    try {
      const response = await fetch(
        "https://maps.googleapis.com/maps/api/place/textsearch/json?query=test&key=test",
        {
          method: "HEAD",
        },
      );
      results.places = response.status !== 0;
    } catch {
      // Network error
    }

    // Test icon service
    try {
      const response = await fetch(
        "https://openweathermap.org/img/wn/01d@2x.png",
        {
          method: "HEAD",
        },
      );
      results.icons = response.ok;
    } catch {
      // Network error
    }

    return results;
  },
};

/**
 * Error types for service operations
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public code?: string | number,
    public details?: any,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export class RateLimitError extends ServiceError {
  constructor(service: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${service}`, service, "RATE_LIMIT");
    this.retryAfter = retryAfter;
  }

  retryAfter?: number;
}

export class ApiKeyError extends ServiceError {
  constructor(service: string) {
    super(
      `Invalid or missing API key for ${service}`,
      service,
      "API_KEY_ERROR",
    );
  }
}

export class NetworkError extends ServiceError {
  constructor(service: string, originalError?: Error) {
    super(`Network error accessing ${service}`, service, "NETWORK_ERROR");
    this.originalError = originalError;
  }

  originalError?: Error;
}
