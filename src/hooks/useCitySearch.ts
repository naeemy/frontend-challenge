// @ts-nocheck
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRecentCities } from "./useCityList";
import type { City } from "@/types/location";

export interface UseCitySearchOptions {
  debounceMs?: number;
  maxResults?: number;
  minQueryLength?: number;
  includeSuggestions?: boolean;
  onSearchStart?: (query: string) => void;
  onSearchComplete?: (results: City[], query: string) => void;
  onError?: (error: string) => void;
}

export interface UseCitySearchReturn {
  suggestions: City[];
  isLoading: boolean;
  error: string | null;

  searchCities: (query: string) => Promise<void>;
  clearSuggestions: () => void;
  selectCity: (city: City) => void;
  searchHistory: City[];
  clearHistory: () => void;
}

/**
 * Hook for searching cities with debouncing and caching
 */
export function useCitySearch(
  options: UseCitySearchOptions = {},
): UseCitySearchReturn {
  const {
    debounceMs = 300,
    maxResults = 10,
    minQueryLength = 2,
    includeSuggestions = true,
    onSearchStart,

    onSearchComplete,
    onError,
  } = options;

  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { recentCities, addToRecent, clearRecent } = useRecentCities();

  // Cache for search results
  const cacheRef = useRef<Map<string, City[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock city search function (replace with actual API call)
  const searchCitiesAPI = useCallback(
    async (query: string, signal: AbortSignal): Promise<City[]> => {
      // This is a mock implementation - replace with your actual API
      // Example with OpenWeatherMap Geocoding API or Google Places API

      try {
        const apiKey =
          process.env.NEXT_PUBLIC_PLACES_API_KEY || process.env.PLACES_API_KEY;

        if (!apiKey) {
          throw new Error("Places API key not configured");
        }

        // Mock data for development - replace with actual API call
        const mockCities: City[] = [
          {
            id: `${query}-1`,
            name: `${query} City`,
            country: "US",
            state: "California",

            coordinates: { lat: 37.7749, lon: -122.4194 },
            timezone: "America/Los_Angeles",
            population: 1000000,
          },
          {
            id: `${query}-2`,
            name: `New ${query}`,
            country: "US",
            state: "New York",
            coordinates: { lat: 40.7128, lon: -74.006 },
            timezone: "America/New_York",
            population: 500000,
          },
          {
            id: `${query}-3`,
            name: `${query}burg`,
            country: "DE",
            coordinates: { lat: 52.52, lon: 13.405 },
            timezone: "Europe/Berlin",
            population: 300000,
          },
        ];

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if request was aborted
        if (signal.aborted) {
          throw new Error("Request aborted");
        }

        return mockCities.slice(0, maxResults);

        // Real API implementation would look like:
        /*
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${maxResults}&appid=${apiKey}`,
          { signal }
        )

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        
        return data.map((item: any) => ({
          id: `${item.lat}-${item.lon}`,

          name: item.name,
          country: item.country,
          state: item.state,
          coordinates: { lat: item.lat, lon: item.lon },
          // Add other properties as needed
        }))
        */
      } catch (error) {
        if (signal.aborted) {
          throw new Error("Search cancelled");
        }
        throw error;
      }
    },
    [maxResults],
  );

  // Search cities with debouncing
  const searchCities = useCallback(
    async (query: string): Promise<void> => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Validate query

      if (query.trim().length < minQueryLength) {
        setSuggestions([]);
        setError(null);

        return;
      }

      // Debounce the search
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Check cache first
          const normalizedQuery = query.toLowerCase().trim();
          const cached = cacheRef.current.get(normalizedQuery);

          if (cached) {
            setSuggestions(cached);
            setError(null);
            onSearchComplete?.(cached, query);

            return;
          }

          // Cancel previous request
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }

          // Create new abort controller
          abortControllerRef.current = new AbortController();

          setIsLoading(true);
          setError(null);

          onSearchStart?.(query);

          const results = await searchCitiesAPI(
            query,
            abortControllerRef.current.signal,
          );

          // Cache the results
          cacheRef.current.set(normalizedQuery, results);

          // Limit cache size
          if (cacheRef.current.size > 50) {
            const firstKey = cacheRef.current.keys().next().value;

            cacheRef.current.delete(firstKey);
          }

          setSuggestions(results);
          onSearchComplete?.(results, query);
        } catch (err) {
          if (err instanceof Error && err.message !== "Search cancelled") {
            const errorMessage = err.message || "Failed to search cities";
            setError(errorMessage);
            onError?.(errorMessage);
          }
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [
      minQueryLength,
      debounceMs,
      searchCitiesAPI,
      onSearchStart,
      onSearchComplete,
      onError,
    ],
  );

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Select a city (add to recent and clear suggestions)
  const selectCity = useCallback(
    (city: City) => {
      addToRecent(city);
      clearSuggestions();
    },
    [addToRecent, clearSuggestions],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,

    error,
    searchCities,
    clearSuggestions,
    selectCity,
    searchHistory: recentCities,
    clearHistory: clearRecent,
  };
}

/**
 * Hook for autocomplete functionality with suggestions
 */
export function useAutocomplete(options: UseCitySearchOptions = {}) {
  const {
    suggestions,
    isLoading,
    error,
    searchCities,
    clearSuggestions,
    selectCity,
  } = useCitySearch(options);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  // Handle input change
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIndex(-1);

      if (value.trim().length >= (options.minQueryLength || 2)) {
        searchCities(value);
        setIsOpen(true);
      } else {
        clearSuggestions();
        setIsOpen(false);
      }
    },
    [searchCities, clearSuggestions, options.minQueryLength],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );

          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0) {
            const selectedCity = suggestions[selectedIndex];
            selectCity(selectedCity);

            setQuery(selectedCity.name);
            setIsOpen(false);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, selectCity],
  );

  // Handle city selection
  const handleCitySelect = useCallback(
    (city: City) => {
      selectCity(city);
      setQuery(city.name);
      setIsOpen(false);

      setSelectedIndex(-1);
    },
    [selectCity],
  );

  // Close dropdown

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  return {
    query,
    suggestions,
    isLoading,
    error,
    isOpen,
    selectedIndex,

    handleInputChange,
    handleKeyDown,
    handleCitySelect,
    close,
  };
}
