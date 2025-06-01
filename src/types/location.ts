/**
 * Geographic coordinates interface
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Bounds for geographic regions
 */
export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * City/Location data structure
 */
export interface City {
  /** Unique identifier for the city */
  id: string;

  /** City name */
  name: string;

  /** Country code (ISO 3166-1 alpha-2) */
  country: string;

  /** State/Province/Region name (optional) */
  state?: string;

  /** Geographic coordinates */
  coordinates: Coordinates;

  /** Timezone identifier (e.g., 'America/New_York') */
  timezone?: string;

  /** Population count */
  population?: number;

  /** Elevation in meters */
  elevation?: number;

  /** When the city was added to user's list */
  addedAt?: number;

  /** Whether this city is marked as favorite */

  isFavorite?: boolean;

  /** Additional metadata */
  metadata?: CityMetadata;
}

/**
 * Additional city metadata
 */
export interface CityMetadata {
  /** Administrative area level 1 (state/province) */
  adminArea1?: string;

  /** Administrative area level 2 (county/district) */
  adminArea2?: string;

  /** Postal code */

  postalCode?: string;

  /** City type (city, town, village, etc.) */
  type?: CityType;

  /** Official website URL */
  website?: string;

  /** Wikipedia URL */
  wikipedia?: string;

  /** Featured image URL */
  imageUrl?: string;

  /** Brief description */
  description?: string;

  /** Languages spoken (ISO 639-1 codes) */

  languages?: string[];

  /** Currency code (ISO 4217) */
  currency?: string;
}

/**
 * Types of settlements
 */

export type CityType =
  | "city"
  | "town"
  | "village"
  | "municipality"
  | "district"
  | "borough"
  | "capital"
  | "metropolis";

/**
 * Search suggestion with additional context
 */
export interface CitySearchResult extends City {
  /** Search relevance score */

  score?: number;

  /** Highlighted text for search matches */
  highlighted?: {
    name?: string;
    state?: string;
    country?: string;
  };

  /** Distance from user's location (if available) */
  distance?: {
    value: number;
    unit: "km" | "mi";
    formatted: string;
  };
}

/**
 * Location search filters
 */
export interface LocationSearchFilters {
  /** Filter by country codes */
  countries?: string[];

  /** Filter by city types */
  types?: CityType[];

  /** Minimum population */
  minPopulation?: number;

  /** Maximum population */
  maxPopulation?: number;

  /** Search within bounds */
  bounds?: GeoBounds;

  /** Search within radius of a point */
  radius?: {
    center: Coordinates;
    distance: number;
    unit: "km" | "mi";
  };

  /** Language preference for results */
  language?: string;
}

/**
 * Location search options
 */
export interface LocationSearchOptions {
  /** Maximum number of results */
  limit?: number;

  /** Search filters */
  filters?: LocationSearchFilters;

  /** Include additional metadata */
  includeMetadata?: boolean;

  /** User's current location for distance calculations */
  userLocation?: Coordinates;

  /** Preferred language for results */
  language?: string;
}

/**
 * Geolocation result from browser API
 */

export interface GeolocationResult {
  coordinates: Coordinates;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

/**
 * Address components from geocoding
 */
export interface AddressComponents {
  streetNumber?: string;
  streetName?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

/**
 * Reverse geocoding result
 */
export interface ReverseGeocodeResult {
  coordinates: Coordinates;
  address: AddressComponents;
  city?: City;
  confidence?: number;
}

/**
 * User's location preferences
 */
export interface LocationPreferences {
  /** Automatically detect location */
  autoDetect: boolean;

  /** Default city when location unavailable */

  defaultCity?: City;

  /** Preferred distance unit */
  distanceUnit: "km" | "mi";

  /** Show distance in city lists */

  showDistance: boolean;

  /** Location detection accuracy */
  accuracy: "low" | "medium" | "high";

  /** Cache location for offline use */
  cacheLocation: boolean;
}

/**
 * Location service provider types
 */
export type LocationProvider =
  | "google"
  | "openstreetmap"
  | "mapbox"
  | "here"
  | "opencage";

/**
 * Location service configuration
 */

export interface LocationServiceConfig {
  provider: LocationProvider;
  apiKey?: string;

  baseUrl?: string;

  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
  timeout?: number;
  retries?: number;
}

/**
 * Predefined location collections
 */
export interface LocationCollection {
  id: string;
  name: string;
  description?: string;
  cities: City[];
  category: LocationCollectionCategory;
  isOfficial?: boolean;
}

/**
 * Location collection categories
 */
export type LocationCollectionCategory =
  | "capitals"
  | "major-cities"
  | "tourist-destinations"
  | "business-hubs"
  | "coastal-cities"
  | "mountain-cities"
  | "historical-cities"
  | "tech-hubs"
  | "cultural-centers"
  | "custom";
