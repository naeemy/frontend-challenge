"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTemperaturePreferences } from "./useTemperatureUnit";
import { useLocalStorageWithExpiry } from "./useLocalStorage";
import type { WeatherData } from "@/types/weather";
import type { ForecastData } from "@/types/forecast";

export interface UseWeatherDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  cacheExpiry?: number; // in minutes
  onError?: (error: string) => void;
  onSuccess?: (data: WeatherData) => void;
}

export interface UseWeatherDataReturn {
  weatherData: WeatherData | null;

  forecast: ForecastData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for fetching and managing weather data with caching and auto-refresh
 */
export function useWeatherData(
  cityId: string | null,
  options: UseWeatherDataOptions = {},
): UseWeatherDataReturn {
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    cacheExpiry = 10, // 10 minutes
    onError,
    onSuccess,
  } = options;

  const { getApiUnits } = useTemperaturePreferences();

  const [weatherData, setWeatherData] =
    useLocalStorageWithExpiry<WeatherData | null>(
      `weather_${cityId}`,
      null,
      cacheExpiry,
    );

  const [forecast, setForecast] = useLocalStorageWithExpiry<ForecastData[]>(
    `forecast_${cityId}`,
    [],
    cacheExpiry,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock weather API function (replace with actual API)
  const fetchWeatherFromAPI = useCallback(
    async (
      cityId: string,
      signal: AbortSignal,
    ): Promise<{ weather: WeatherData; forecast: ForecastData[] }> => {
      const apiKey =
        process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
        process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        throw new Error("Weather API key not configured");
      }

      // Mock implementation - replace with actual API calls
      const mockWeatherData: WeatherData = {
        dt: Math.floor(Date.now() / 1000),
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        feelsLike: Math.floor(Math.random() * 30) + 10,
        condition: ["clear", "cloudy", "rain", "snow"][
          Math.floor(Math.random() * 4)
        ],
        icon: "01d",
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
        pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        windDirection: Math.floor(Math.random() * 360),

        visibility: Math.floor(Math.random() * 15) + 5, // 5-20 km
        uvIndex: Math.floor(Math.random() * 11),
        cloudCover: Math.floor(Math.random() * 100),
        dewPoint: Math.floor(Math.random() * 20) + 5,
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockForecast: ForecastData[] = Array.from(
        { length: 24 },
        (_, i) => ({
          dt: Math.floor(Date.now() / 1000) + i * 3600, // Every hour
          temperature: Math.floor(Math.random() * 25) + 10,
          condition: ["clear", "cloudy", "rain"][Math.floor(Math.random() * 3)],
          icon: "01d",

          precipitation: Math.floor(Math.random() * 30),
          humidity: Math.floor(Math.random() * 50) + 30,
          windSpeed: Math.floor(Math.random() * 15) + 5,
        }),
      );

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (signal.aborted) {
        throw new Error("Request cancelled");
      }

      return {
        weather: mockWeatherData,

        forecast: mockForecast,
      };

      // Real API implementation would look like:
      /*
      const units = getApiUnits('openweather')
      
      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}&units=${units}`,
        { signal }
      )

      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`)
      }
      
      const weatherJson = await weatherResponse.json()

      
      // Fetch forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${apiKey}&units=${units}`,
        { signal }
      )
      

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`)
      }
      
      const forecastJson = await forecastResponse.json()
      
      // Transform API data to our types
      const weather: WeatherData = {
        dt: weatherJson.dt,
        temperature: weatherJson.main.temp,
        feelsLike: weatherJson.main.feels_like,
        condition: weatherJson.weather[0].description,

        icon: weatherJson.weather[0].icon,
        humidity: weatherJson.main.humidity,

        pressure: weatherJson.main.pressure,
        windSpeed: weatherJson.wind.speed,
        windDirection: weatherJson.wind.deg,
        visibility: weatherJson.visibility / 1000,
        // Add other fields as available
      }
      
      const forecast: ForecastData[] = forecastJson.list.map((item: any) => ({
        dt: item.dt,
        temperature: item.main.temp,
        condition: item.weather[0].description,
        icon: item.weather[0].icon,

        precipitation: (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0),
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
      }))
      
      return { weather, forecast }
      */
    },
    [getApiUnits],
  );

  // Fetch weather data
  const fetchWeatherData = useCallback(
    async (force = false): Promise<void> => {
      if (!cityId) return;

      // Don't fetch if already loading or if data exists and not forcing
      if (
        isLoading ||
        (!force && weatherData && Date.now() - (lastUpdated || 0) < 60000)
      ) {
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const { weather, forecast: forecastData } = await fetchWeatherFromAPI(
          cityId,
          abortControllerRef.current.signal,
        );

        setWeatherData(weather);
        setForecast(forecastData);
        setLastUpdated(Date.now());
        onSuccess?.(weather);
      } catch (err) {
        if (err instanceof Error && err.message !== "Request cancelled") {
          const errorMessage = err.message || "Failed to fetch weather data";
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      cityId,
      isLoading,
      weatherData,
      lastUpdated,
      fetchWeatherFromAPI,
      setWeatherData,
      setForecast,
      onSuccess,
      onError,
    ],
  );

  // Refetch function for manual refresh

  const refetch = useCallback(() => fetchWeatherData(true), [fetchWeatherData]);

  // Clear cache
  const clearCache = useCallback(() => {
    setWeatherData(null);

    setForecast([]);
    setLastUpdated(null);

    setError(null);
  }, [setWeatherData, setForecast]);

  // Initial fetch when cityId changes
  useEffect(() => {
    if (cityId) {
      fetchWeatherData();
    } else {
      clearCache();
    }
  }, [cityId, fetchWeatherData, clearCache]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !cityId) return;

    refreshTimerRef.current = setInterval(() => {
      fetchWeatherData();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, cityId, fetchWeatherData, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  return {
    weatherData,
    forecast,
    isLoading,
    error,
    lastUpdated,
    refetch,
    clearCache,
  };
}

/**
 * Hook for managing multiple cities' weather data
 */
export function useMultipleWeatherData(
  cityIds: string[],
  options: UseWeatherDataOptions = {},
) {
  const [weatherMap, setWeatherMap] = useState<Map<string, WeatherData>>(
    new Map(),
  );
  const [loadingMap, setLoadingMap] = useState<Map<string, boolean>>(new Map());
  const [errorMap, setErrorMap] = useState<Map<string, string>>(new Map());

  const updateWeatherForCity = useCallback(
    (cityId: string, weather: WeatherData | null) => {
      setWeatherMap((prev) => {
        const newMap = new Map(prev);
        if (weather) {
          newMap.set(cityId, weather);
        } else {
          newMap.delete(cityId);
        }
        return newMap;
      });
    },
    [],
  );

  const updateLoadingForCity = useCallback(
    (cityId: string, loading: boolean) => {
      setLoadingMap((prev) => {
        const newMap = new Map(prev);
        if (loading) {
          newMap.set(cityId, true);
        } else {
          newMap.delete(cityId);
        }
        return newMap;
      });
    },
    [],
  );

  const updateErrorForCity = useCallback(
    (cityId: string, error: string | null) => {
      setErrorMap((prev) => {
        const newMap = new Map(prev);
        if (error) {
          newMap.set(cityId, error);
        } else {
          newMap.delete(cityId);
        }
        return newMap;
      });
    },
    [],
  );

  // Create individual hooks for each city
  const cityHooks = cityIds.map((cityId) =>
    useWeatherData(cityId, {
      ...options,
      onSuccess: (data) => {
        updateWeatherForCity(cityId, data);
        updateLoadingForCity(cityId, false);
        updateErrorForCity(cityId, null);
        options.onSuccess?.(data);
      },
      onError: (error) => {
        updateErrorForCity(cityId, error);

        updateLoadingForCity(cityId, false);
        options.onError?.(error);
      },
    }),
  );

  // Update loading states
  useEffect(() => {
    cityHooks.forEach((hook, index) => {
      const cityId = cityIds[index];
      updateLoadingForCity(cityId, hook.isLoading);
    });
  }, [cityHooks, cityIds, updateLoadingForCity]);

  const refetchAll = useCallback(async () => {
    await Promise.all(cityHooks.map((hook) => hook.refetch()));
  }, [cityHooks]);

  return {
    weatherMap,
    loadingMap,

    errorMap,
    isAnyLoading: Array.from(loadingMap.values()).some(Boolean),
    hasAnyError: errorMap.size > 0,
    refetchAll,
  };
}
