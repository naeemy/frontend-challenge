"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchBox, SuggestionList } from "@/components/features";
import { SearchResults } from "@/components/sections";
import { Button, Text, LoadingSpinner } from "@/components/ui";
import { useCitySearch, useCityList } from "@/hooks";
import type { City } from "@/types/location";

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const {
    suggestions,
    isLoading: isSearching,
    error: searchError,
    searchCities,
  } = useCitySearch();

  const { addCity, cities } = useCityList();

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim().length >= 2) {
        searchCities(query);
      }
    },
    [searchCities],
  );

  const handleCitySelect = useCallback((city: City) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
  }, []);

  const handleAddCity = useCallback(async () => {
    if (!selectedCity) return;

    setIsAdding(true);
    try {
      await addCity(selectedCity);
      router.push("/");
    } catch (error) {
      console.error("Failed to add city:", error);

      // You might want to show an error toast here
    } finally {
      setIsAdding(false);
    }
  }, [selectedCity, addCity, router]);

  const isCityAlreadyAdded =
    selectedCity &&
    cities.some(
      (city) =>
        city.id === selectedCity.id ||
        (city.name === selectedCity.name &&
          city.country === selectedCity.country),
    );

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
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
          <div>
            <Text
              as="h1"
              variant="heading"
              className="text-2xl font-bold text-gray-900"
            >
              Add City
            </Text>
          </div>
        </div>

        <Text className="text-gray-600">
          Search for cities to add to your weather dashboard
        </Text>
      </div>

      {/* Search Section */}
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <SearchBox
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for a city..."
            showSuggestions={false}
            autoFocus={true}
            className="w-full"
          />

          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500"
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

              <Text className="text-red-700 font-medium">Search failed</Text>
            </div>
            <Text className="text-red-600 text-sm mt-1">{searchError}</Text>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !selectedCity && (
          <div className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Search Results
            </Text>
            <SuggestionList
              suggestions={suggestions}
              onSelect={handleCitySelect}
              searchQuery={searchQuery}
            />
          </div>
        )}

        {/* Selected City Preview */}
        {selectedCity && (
          <div className="space-y-4">
            <Text className="text-sm font-medium text-gray-700">
              City Preview
            </Text>

            <SearchResults
              city={selectedCity}
              onClear={() => {
                setSelectedCity(null);
                setSearchQuery("");
              }}
            />

            {/* Add Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddCity}
                disabled={isAdding || isCityAlreadyAdded!}
                className="flex-1"
                size="lg"
              >
                {isAdding ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : isCityAlreadyAdded ? (
                  "Already Added"
                ) : (
                  "Add to My Cities"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCity(null);
                  setSearchQuery("");
                }}
                size="lg"
              >
                Clear
              </Button>
            </div>

            {isCityAlreadyAdded && (
              <Text className="text-sm text-amber-600 text-center">
                This city is already in your list
              </Text>
            )}
          </div>
        )}

        {/* Empty State */}
        {searchQuery.length >= 2 &&
          suggestions.length === 0 &&
          !isSearching &&
          !searchError && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Text className="text-gray-600 font-medium mb-1">
                No cities found
              </Text>
              <Text className="text-gray-500 text-sm">
                Try searching with a different spelling or check the city name
              </Text>
            </div>
          )}

        {/* Search Hint */}

        {searchQuery.length < 2 && searchQuery.length > 0 && (
          <div className="text-center py-4">
            <Text className="text-gray-500 text-sm">
              Type at least 2 characters to search
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
