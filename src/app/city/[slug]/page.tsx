"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { WeatherDetails, HourlyForecast } from "@/components/sections";
import { Button, Text, LoadingSpinner } from "@/components/ui";
import {
  LocationDisplay,
  TemperatureUnitSelector,
} from "@/components/features";
import { useWeatherData, useCityList, useTemperatureUnit } from "@/hooks";
import type { City } from "@/types/location";

export default function CityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const citySlug = params.slug as string;

  const [city, setCity] = useState<City | null>(null);

  const [cityNotFound, setCityNotFound] = useState(false);

  const { cities, removeCity } = useCityList();
  const { unit, setUnit } = useTemperatureUnit();
  const {
    weatherData,
    forecast,
    isLoading,
    error,

    refetch,
  } = useWeatherData(city?.id || null);

  // Find the city from the slug
  useEffect(() => {
    if (!citySlug || cities.length === 0) return;

    // Convert slug back to city (assuming slug is city-name-country format)
    const decodedSlug = decodeURIComponent(citySlug);
    const foundCity = cities.find((c) => {
      const citySlug = `${c.name}-${c.country}`
        .toLowerCase()
        .replace(/\s+/g, "-");
      return citySlug === decodedSlug.toLowerCase();
    });

    if (foundCity) {
      setCity(foundCity);
      setCityNotFound(false);
    } else {
      setCityNotFound(true);
    }
  }, [citySlug, cities]);

  const handleRemoveCity = async () => {
    if (!city) return;

    try {
      await removeCity(city.id);
      router.push("/");
    } catch (error) {
      console.error("Failed to remove city:", error);
      // Show error toast/message
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Loading state while finding city
  if (!citySlug || (cities.length === 0 && !cityNotFound)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // City not found
  if (cityNotFound) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <Text className="text-gray-600 font-medium mb-2">City not found</Text>
          <Text className="text-gray-500 text-sm text-center mb-6">
            The requested city is not in your list or may have been removed
          </Text>

          <Button onClick={() => router.push("/")}>Back to Cities</Button>
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>

            <LocationDisplay city={city} showTime={true} className="flex-1" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <TemperatureUnitSelector
              value={unit}
              onChange={setUnit}
              size="sm"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCity}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Error State */}
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <Text className="text-red-700 font-medium">
                Failed to load weather data
              </Text>
            </div>

            <Text className="text-red-600 text-sm mb-4">{error}</Text>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !weatherData && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <Text className="text-gray-600">Loading weather data...</Text>
            </div>
          </div>
        )}

        {/* Weather Content */}

        {weatherData && (
          <>
            {/* Current Weather Details */}
            <WeatherDetails
              weather={weatherData}
              city={city}
              temperatureUnit={unit}
            />

            {/* Hourly Forecast */}
            {forecast && forecast.length > 0 && (
              <HourlyForecast forecast={forecast} temperatureUnit={unit} />
            )}
          </>
        )}
      </div>

      {/* Last Updated */}
      {weatherData && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Text className="text-sm text-gray-500 text-center">
            Last updated: {new Date(weatherData.dt * 1000).toLocaleString()}
          </Text>
        </div>
      )}
    </div>
  );
}
