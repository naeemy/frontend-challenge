import type {
  City,
  CitySearchResult,
  Coordinates,
  LocationSearchOptions,
  CityType,
} from "@/types";

/**
 * Google Places API response interfaces
 */
interface PlacesTextSearchResponse {
  candidates?: PlacesCandidate[];
  status:
    | "OK"
    | "ZERO_RESULTS"
    | "OVER_QUERY_LIMIT"
    | "REQUEST_DENIED"
    | "INVALID_REQUEST";
  error_message?: string;
}

interface PlacesCandidate {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport?: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  types: string[];
  rating?: number;

  price_level?: number;
}

interface PlacesAutocompleteResponse {
  predictions: PlacesPrediction[];
  status:
    | "OK"
    | "ZERO_RESULTS"
    | "OVER_QUERY_LIMIT"
    | "REQUEST_DENIED"
    | "INVALID_REQUEST";
  error_message?: string;
}

interface PlacesPrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    main_text_matched_substrings?: Array<{
      offset: number;
      length: number;
    }>;
    secondary_text?: string;
    secondary_text_matched_substrings?: Array<{
      offset: number;
      length: number;
    }>;
  };
  terms: Array<{
    offset: number;
    value: string;
  }>;
  types: string[];
  matched_substrings: Array<{
    offset: number;
    length: number;
  }>;
}

interface PlaceDetailsResponse {
  result: PlaceDetails;
  status:
    | "OK"
    | "NOT_FOUND"
    | "ZERO_RESULTS"
    | "OVER_QUERY_LIMIT"
    | "REQUEST_DENIED"
    | "INVALID_REQUEST";
  error_message?: string;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  types: string[];
  url?: string;
  website?: string;
  international_phone_number?: string;

  utc_offset?: number;
  vicinity?: string;
}

/**
 * Places API configuration

 */
export interface PlacesConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  language?: string;
  region?: string;
  rateLimit?: {
    requests: number;
    window: number; // milliseconds
  };
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Partial<PlacesConfig> = {
  baseUrl: "https://maps.googleapis.com/maps/api/place",
  timeout: 8000,

  language: "en",
  rateLimit: {
    requests: 100,
    window: 60000, // 1 minute
  },
  retry: {
    attempts: 2,
    delay: 500,
  },
};

/**
 * City type filters for Places API
 */
const CITY_TYPES = [
  "locality",

  "administrative_area_level_1",

  "administrative_area_level_2",

  "sublocality",
  "neighborhood",
  "political",
  "country",
];

/**
 * Places API service class
 */
export class PlacesApiService {
  private config: PlacesConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();

  private lastRequestTime: number = 0;
  private requestCount: number = 0;

  constructor(config: PlacesConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (!this.config.apiKey) {
      throw new Error("Google Places API key is required");
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
    if (this.requestCount >= (this.config.rateLimit?.requests || 100)) {
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

    const { attempts = 2, delay = 500 } = this.config.retry || {};
    let lastError: Error;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const fetchOptions: RequestInit = {
          headers: {
            Accept: "application/json",
          },
        };

        // Only add signal if it's defined
        if (signal) {
          fetchOptions.signal = signal;
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(
            `Places API error ${response.status}: ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          throw new Error(
            `Places API error: ${data.status} - ${data.error_message || "Unknown error"}`,
          );
        }

        return data;
      } catch (error) {
        lastError = error as Error;

        if (signal?.aborted) {
          throw new Error("Request cancelled");
        }

        // Don't retry on client errors
        if (error instanceof Error && error.message.includes("4")) {
          throw error;
        }

        // Wait before retry
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
    const url = new URL(`${baseUrl}/${endpoint}/json`);

    // Add API key
    url.searchParams.set("key", this.config.apiKey);

    // Add default parameters
    if (this.config.language) {
      url.searchParams.set("language", this.config.language);
    }
    if (this.config.region) {
      url.searchParams.set("region", this.config.region);
    }

    // Add custom parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });

    return url.toString();
  }

  /**
   * Extract country and state from address components
   */
  private extractLocationComponents(
    addressComponents: PlaceDetails["address_components"],
  ) {
    let country = "";
    let countryCode = "";
    let state: string | undefined = undefined;
    let city = "";

    for (const component of addressComponents) {
      if (component.types.includes("country")) {
        country = component.long_name;
        countryCode = component.short_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        state = component.long_name;
      } else if (
        component.types.includes("locality") ||
        component.types.includes("administrative_area_level_2")
      ) {
        if (!city) {
          city = component.long_name;
        }
      }
    }

    return { country, countryCode, state, city };
  }

  /**
   * Transform Places prediction to CitySearchResult
   */
  private transformPredictionToCity(
    prediction: PlacesPrediction,
  ): Partial<CitySearchResult> {
    const terms = prediction.terms;
    const mainText = prediction.structured_formatting.main_text;
    const secondaryText = prediction.structured_formatting.secondary_text || "";

    // Extract city and country from terms
    const cityName = terms[0]?.value || mainText;
    const countryName = terms[terms.length - 1]?.value || "";

    const result: Partial<CitySearchResult> = {
      id: prediction.place_id,
      name: cityName,
      country: countryName,
      highlighted: {
        name: this.highlightMatches(mainText, prediction.matched_substrings),
        country: countryName,
      },
    };

    // Only add state if it exists
    if (secondaryText.includes(",")) {
      const stateValue = secondaryText.split(",")[0]?.trim();
      if (stateValue) {
        result.state = stateValue;
      }
    }

    return result;
  }

  /**
   * Highlight matched text for search results
   */
  private highlightMatches(
    text: string,
    matches: Array<{ offset: number; length: number }>,
  ): string {
    if (!matches || matches.length === 0) return text;

    let highlighted = text;
    let offset = 0;

    matches.forEach((match) => {
      const start = match.offset + offset;
      const end = start + match.length;
      const before = highlighted.slice(0, start);
      const matched = highlighted.slice(start, end);

      const after = highlighted.slice(end);

      highlighted = `${before}<mark>${matched}</mark>${after}`;

      offset += 13; // Length of '<mark></mark>'
    });

    return highlighted;
  }

  /**
   * Get autocomplete suggestions for city search
   */
  async getAutocompleteSuggestions(
    query: string,
    options: LocationSearchOptions = {},
    signal?: AbortSignal,
  ): Promise<CitySearchResult[]> {
    if (query.trim().length < 2) {
      return [];
    }

    const cacheKey = `autocomplete-${query}-${JSON.stringify(options)}`;

    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const params: Record<string, string | number> = {
          input: query.trim(),
          types: "(cities)",
        };

        // Add location bias if provided
        if (options.userLocation) {
          params.location = `${options.userLocation.lat},${options.userLocation.lon}`;
          params.radius = "50000"; // 50km radius
        }

        // Add country restriction if provided
        if (
          options.filters?.countries &&
          options.filters.countries.length > 0
        ) {
          params.components = `country:${options.filters.countries.join("|country:")}`;
        }

        const url = this.buildUrl("autocomplete", params);
        const data = await this.makeRequest<PlacesAutocompleteResponse>(
          url,
          signal,
        );

        if (data.status === "ZERO_RESULTS") {
          return [];
        }

        const cities = data.predictions
          .filter((prediction) =>
            prediction.types.some((type) => CITY_TYPES.includes(type)),
          )
          .slice(0, options.limit || 10)
          .map((prediction) => this.transformPredictionToCity(prediction));

        // Get detailed information for each city
        const detailedCities = await Promise.all(
          cities.map(async (city) => {
            if (!city.id) return null;
            try {
              const details = await this.getPlaceDetails(city.id, signal);
              return { ...city, ...details };
            } catch (error) {
              console.warn(
                `Failed to get details for place ${city.id}:`,

                error,
              );
              return city;
            }
          }),
        );

        return detailedCities.filter(
          (city): city is CitySearchResult => city !== null,
        );
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Search for cities by text query
   */
  async searchCities(
    query: string,
    options: LocationSearchOptions = {},
    signal?: AbortSignal,
  ): Promise<CitySearchResult[]> {
    const cacheKey = `search-${query}-${JSON.stringify(options)}`;

    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const params: Record<string, string | number> = {
          query: `${query.trim()} city`,
          type: "locality",
        };

        // Add location bias if provided
        if (options.userLocation) {
          params.location = `${options.userLocation.lat},${options.userLocation.lon}`;
          params.radius = "100000"; // 100km radius
        }

        const url = this.buildUrl("textsearch", params);
        const data = await this.makeRequest<PlacesTextSearchResponse>(
          url,
          signal,
        );

        if (data.status === "ZERO_RESULTS" || !data.candidates) {
          return [];
        }

        const cities = await Promise.all(
          data.candidates
            .slice(0, options.limit || 10)
            .map(async (candidate) => {
              try {
                const details = await this.getPlaceDetails(
                  candidate.place_id,
                  signal,
                );
                return {
                  ...details,
                  score: this.calculateRelevanceScore(query, details.name),
                };
              } catch (error) {
                console.warn(
                  `Failed to get details for place ${candidate.place_id}:`,
                  error,
                );
                return null;
              }
            }),
        );

        const validCities = cities.filter((city) => city !== null) as Array<
          City & { score: number }
        >;

        return validCities.sort((a, b) => b.score - a.score);
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, requestPromise);

    return requestPromise;
  }

  /**
   * Get detailed information for a place
   */
  async getPlaceDetails(placeId: string, signal?: AbortSignal): Promise<City> {
    const cacheKey = `details-${placeId}`;

    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const params = {
          place_id: placeId,
          fields:
            "place_id,name,formatted_address,geometry,address_components,types,website,url,utc_offset",
        };

        const url = this.buildUrl("details", params);

        const data = await this.makeRequest<PlaceDetailsResponse>(url, signal);

        const place = data.result;
        const { country, countryCode, state, city } =
          this.extractLocationComponents(place.address_components);

        const metadata: any = {
          description: place.formatted_address,
          type: this.getCityType(place.types),
        };

        // Only add website if it exists
        if (place.website) {
          metadata.website = place.website;
        }

        const result: City = {
          id: place.place_id,
          name: city || place.name,
          country: countryCode || country,
          coordinates: {
            lat: place.geometry.location.lat,
            lon: place.geometry.location.lng,
          },
          metadata,
        };

        // Only add optional properties if they exist
        if (state) {
          result.state = state;
        }

        if (place.utc_offset !== undefined) {
          const timezoneValue = this.getTimezoneFromOffset(place.utc_offset);
          if (timezoneValue) {
            result.timezone = timezoneValue;
          }
        }

        return result;
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Reverse geocode coordinates to get city information
   */
  async reverseGeocode(
    coordinates: Coordinates,
    signal?: AbortSignal,
  ): Promise<City | null> {
    const cacheKey = `reverse-${coordinates.lat}-${coordinates.lon}`;

    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        // Use Google Geocoding API
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lon}&key=${this.config.apiKey}&result_type=locality|administrative_area_level_1|country`;

        const fetchOptions: RequestInit = {};
        if (signal) {
          fetchOptions.signal = signal;
        }

        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`Geocoding error: ${response.status}`);
        }

        const data = await response.json();

        if (
          data.status !== "OK" ||
          !data.results ||
          data.results.length === 0
        ) {
          return null;
        }

        const result = data.results[0];

        const { country, countryCode, state, city } =
          this.extractLocationComponents(result.address_components);

        const cityResult: City = {
          id: result.place_id,
          name: city || result.formatted_address.split(",")[0],
          country: countryCode || country,
          coordinates,
          metadata: {
            description: result.formatted_address,
            type: this.getCityType(result.types),
          },
        };

        // Only add state if it exists
        if (state) {
          cityResult.state = state;
        }

        return cityResult;
      } catch (error) {
        console.warn("Reverse geocoding failed:", error);
        return null;
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(query: string, cityName: string): number {
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedCity = cityName.toLowerCase();

    // Exact match gets highest score
    if (normalizedCity === normalizedQuery) return 100;

    // Starts with query gets high score
    if (normalizedCity.startsWith(normalizedQuery)) return 80;

    // Contains query gets medium score
    if (normalizedCity.includes(normalizedQuery)) return 60;

    // Calculate similarity based on character overlap
    const overlap = this.getStringOverlap(normalizedQuery, normalizedCity);
    return Math.max(20, overlap * 40);
  }

  /**
   * Get string overlap percentage
   */
  private getStringOverlap(str1: string, str2: string): number {
    const shorter = str1.length < str2.length ? str1 : str2;
    const longer = str1.length >= str2.length ? str1 : str2;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i]!)) {
        matches++;
      }
    }

    return matches / shorter.length;
  }

  /**
   * Get timezone from UTC offset (basic implementation)
   */
  private getTimezoneFromOffset(offset: number): string {
    // This is a simplified implementation
    // In a real app, you'd want a more comprehensive timezone mapping
    const hours = offset / 60;

    if (hours === -5) return "America/New_York";
    if (hours === -8) return "America/Los_Angeles";
    if (hours === 0) return "Europe/London";
    if (hours === 1) return "Europe/Paris";
    if (hours === 9) return "Asia/Tokyo";

    return `UTC${hours >= 0 ? "+" : ""}${hours}`;
  }

  /**
   * Get city type from Google Places types
   */
  private getCityType(types: string[]): CityType {
    if (types.includes("locality")) return "city";
    if (types.includes("administrative_area_level_1")) return "capital";
    if (types.includes("administrative_area_level_2")) return "district";
    if (types.includes("sublocality")) return "district";
    if (types.includes("neighborhood")) return "district";
    return "city";
  }

  /**
   * Clear request queue
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
 * Create Places API service instance
 */
export function createPlacesApiService(config: PlacesConfig): PlacesApiService {
  return new PlacesApiService(config);
}

/**
 * Default Places API service instance
 */
export const placesApi = createPlacesApiService({
  apiKey:
    process.env.NEXT_PUBLIC_PLACES_API_KEY || process.env.PLACES_API_KEY || "",
});

/**
 * Export types for external use
 */
export type {
  PlacesTextSearchResponse,
  PlacesAutocompleteResponse,
  PlaceDetailsResponse,
};
