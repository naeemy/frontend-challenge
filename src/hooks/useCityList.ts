// @ts-nocheck
"use client";

import { useState, useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { City } from "@/types/location";

export interface UseCityListOptions {
  maxCities?: number;
  onCityAdded?: (city: City) => void;
  onCityRemoved?: (city: City) => void;
  onError?: (error: string) => void;
}

export interface UseCityListReturn {
  cities: City[];
  isLoading: boolean;
  error: string | null;
  addCity: (city: City) => Promise<void>;
  removeCity: (cityId: string) => Promise<void>;
  updateCity: (cityId: string, updates: Partial<City>) => Promise<void>;

  clearAllCities: () => Promise<void>;
  hasCities: boolean;
  cityCount: number;
  isCityAdded: (cityId: string) => boolean;
  getCityById: (cityId: string) => City | undefined;

  getCityByName: (name: string, country?: string) => City | undefined;
  reorderCities: (startIndex: number, endIndex: number) => void;
}

/**
 * Hook for managing user's city list with persistence and validation
 */

export function useCityList(
  options: UseCityListOptions = {},
): UseCityListReturn {
  const { maxCities = 20, onCityAdded, onCityRemoved, onError } = options;

  const [cities, setCities] = useLocalStorage<City[]>("userCities", []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a city to the list
  const addCity = useCallback(
    async (city: City): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate city object
        if (!city.id || !city.name || !city.country) {
          throw new Error("Invalid city data: missing required fields");
        }

        // Check if city already exists
        const existingCity = cities.find(
          (c) =>
            c.id === city.id ||
            (c.name === city.name && c.country === city.country),
        );

        if (existingCity) {
          throw new Error(`${city.name} is already in your city list`);
        }

        // Check max cities limit
        if (cities.length >= maxCities) {
          throw new Error(`Maximum ${maxCities} cities allowed`);
        }

        // Add timestamp for when city was added
        const cityWithTimestamp: City = {
          ...city,
          addedAt: Date.now(),
        };

        // Add city to the beginning of the list
        setCities((prevCities) => [cityWithTimestamp, ...prevCities]);

        onCityAdded?.(cityWithTimestamp);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add city";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cities, maxCities, setCities, onCityAdded, onError],
  );

  // Remove a city from the list
  const removeCity = useCallback(
    async (cityId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const cityToRemove = cities.find((c) => c.id === cityId);

        if (!cityToRemove) {
          throw new Error("City not found in your list");
        }

        setCities((prevCities) => prevCities.filter((c) => c.id !== cityId));

        onCityRemoved?.(cityToRemove);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove city";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cities, setCities, onCityRemoved, onError],
  );

  // Update city information
  const updateCity = useCallback(
    async (cityId: string, updates: Partial<City>): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const cityIndex = cities.findIndex((c) => c.id === cityId);

        if (cityIndex === -1) {
          throw new Error("City not found in your list");
        }

        setCities((prevCities) => {
          const newCities = [...prevCities];
          newCities[cityIndex] = { ...newCities[cityIndex], ...updates };
          return newCities;
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update city";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cities, setCities, onError],
  );

  // Clear all cities
  const clearAllCities = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    setError(null);

    try {
      setCities([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to clear cities";
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setCities, onError]);

  // Check if a city is already added
  const isCityAdded = useCallback(
    (cityId: string): boolean => {
      return cities.some((c) => c.id === cityId);
    },
    [cities],
  );

  // Get city by ID
  const getCityById = useCallback(
    (cityId: string): City | undefined => {
      return cities.find((c) => c.id === cityId);
    },

    [cities],
  );

  // Get city by name and country
  const getCityByName = useCallback(
    (name: string, country?: string): City | undefined => {
      return cities.find((c) => {
        const nameMatch = c.name.toLowerCase() === name.toLowerCase();

        if (country) {
          return nameMatch && c.country.toLowerCase() === country.toLowerCase();
        }
        return nameMatch;
      });
    },
    [cities],
  );

  // Reorder cities (for drag and drop functionality)
  const reorderCities = useCallback(
    (startIndex: number, endIndex: number): void => {
      if (startIndex === endIndex) return;

      setCities((prevCities) => {
        const newCities = [...prevCities];

        const [removed] = newCities.splice(startIndex, 1);

        newCities.splice(endIndex, 0, removed);
        return newCities;
      });
    },
    [setCities],
  );

  // Clear error when cities change
  useEffect(() => {
    if (error && !isLoading) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, isLoading]);

  return {
    cities,
    isLoading,
    error,
    addCity,
    removeCity,
    updateCity,

    clearAllCities,

    hasCities: cities.length > 0,
    cityCount: cities.length,
    isCityAdded,
    getCityById,
    getCityByName,
    reorderCities,
  };
}

/**
 * Hook for managing recently searched cities
 */
export function useRecentCities(maxRecent: number = 5) {
  const [recentCities, setRecentCities] = useLocalStorage<City[]>(
    "recentCities",
    [],
  );

  const addToRecent = useCallback(
    (city: City) => {
      setRecentCities((prevRecent) => {
        // Remove city if it already exists
        const filtered = prevRecent.filter((c) => c.id !== city.id);

        // Add to beginning and limit to maxRecent
        return [city, ...filtered].slice(0, maxRecent);
      });
    },
    [setRecentCities, maxRecent],
  );

  const clearRecent = useCallback(() => {
    setRecentCities([]);
  }, [setRecentCities]);

  return {
    recentCities,
    addToRecent,
    clearRecent,
  };
}

/**
 * Hook for managing favorite cities (subset of user cities)
 */
export function useFavoriteCities() {
  const { cities, updateCity } = useCityList();

  const favoriteCities = cities.filter((city) => city.isFavorite);

  const toggleFavorite = useCallback(
    async (cityId: string): Promise<void> => {
      const city = cities.find((c) => c.id === cityId);
      if (city) {
        await updateCity(cityId, { isFavorite: !city.isFavorite });
      }
    },
    [cities, updateCity],
  );

  const addToFavorites = useCallback(
    async (cityId: string): Promise<void> => {
      await updateCity(cityId, { isFavorite: true });
    },
    [updateCity],
  );

  const removeFromFavorites = useCallback(
    async (cityId: string): Promise<void> => {
      await updateCity(cityId, { isFavorite: false });
    },
    [updateCity],
  );

  return {
    favoriteCities,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
  };
}
