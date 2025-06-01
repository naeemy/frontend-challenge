"use client";

import React, { Suspense } from "react";
import { CityList } from "@/components/sections";
import { SearchBox, TemperatureUnitSelector } from "@/components/features";
import { LoadingSpinner, Text } from "@/components/ui";
import { useCityList, useTemperatureUnit } from "@/hooks";

export default function HomePage() {
  const { cities, isLoading, error } = useCityList();
  const { unit, setUnit } = useTemperatureUnit();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header Section */}

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Text
              as="h1"
              variant="heading"
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              My Weather
            </Text>
            <Text className="text-gray-600">
              Track weather in your favorite cities
            </Text>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <TemperatureUnitSelector
              value={unit}
              onChange={setUnit}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Quick Search */}
        <div className="max-w-md">
          <SearchBox
            placeholder="Add a new city..."
            showSuggestions={true}
            onCitySelect={(city) => {
              // This will be handled by the SearchBox component internally
              // or we can add a callback here to refresh the city list
            }}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12"
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
            </div>
            <Text className="text-red-600 font-medium mb-2">
              Failed to load cities
            </Text>
            <Text className="text-gray-500 text-sm text-center">{error}</Text>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : cities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
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
            <Text className="text-gray-600 font-medium mb-2">
              No cities added yet
            </Text>

            <Text className="text-gray-500 text-sm text-center max-w-md">
              Use the search box above to add cities and track their weather
              conditions
            </Text>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            }
          >
            <CityList cities={cities} temperatureUnit={unit} />
          </Suspense>
        )}
      </div>

      {/* Footer Info */}
      {cities.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Text className="text-sm text-gray-500 text-center">
            {cities.length} {cities.length === 1 ? "city" : "cities"} • Last
            updated: {new Date().toLocaleTimeString()}
          </Text>
        </div>
      )}
    </div>
  );
}
