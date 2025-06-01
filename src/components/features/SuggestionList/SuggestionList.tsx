import React from "react";
import { Icon, Text } from "@/components/ui";
import { clsx } from "clsx";
import type { City } from "@/types/location";

export interface SuggestionListProps {
  suggestions: City[];
  onSelect: (city: City) => void;
  searchQuery: string;
  focusedIndex?: number;

  onFocusChange?: (index: number) => void;
  maxItems?: number;
  className?: string;
}

export const SuggestionList = React.forwardRef<
  HTMLDivElement,
  SuggestionListProps
>(
  (
    {
      suggestions,
      onSelect,
      searchQuery,
      focusedIndex = -1,
      onFocusChange,

      maxItems = 8,
      className,
    },
    ref,
  ) => {
    // Limit the number of suggestions displayed

    const displayedSuggestions = suggestions.slice(0, maxItems);

    const handleItemClick = (city: City, index: number) => {
      onFocusChange?.(index);
      onSelect(city);
    };

    const handleItemMouseEnter = (index: number) => {
      onFocusChange?.(index);
    };

    const highlightMatch = (text: string, query: string) => {
      if (!query.trim()) return text;

      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      const parts = text.split(regex);

      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-blue-100 text-blue-800 font-medium">
            {part}
          </mark>
        ) : (
          part
        ),
      );
    };

    const getCountryFlag = (countryCode: string) => {
      // Simple country code to flag emoji conversion
      // This is a basic implementation - you might want to use a proper library
      try {
        return countryCode
          .toUpperCase()
          .split("")
          .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
          .join("");
      } catch {
        return "🌍"; // Fallback emoji
      }
    };

    if (displayedSuggestions.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden",

          className,
        )}
        role="listbox"
        aria-label="City suggestions"
      >
        <div className="max-h-64 overflow-y-auto">
          {displayedSuggestions.map((city, index) => (
            <button
              key={`${city.id}-${index}`}
              type="button"
              className={clsx(
                "w-full px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-b-0",
                "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",

                focusedIndex === index && "bg-blue-50 border-blue-100",
              )}
              onClick={() => handleItemClick(city, index)}
              onMouseEnter={() => handleItemMouseEnter(index)}
              role="option"
              aria-selected={focusedIndex === index}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon name="location" size="sm" variant="muted" />
                    <Text className="font-medium text-gray-900 truncate">
                      {highlightMatch(city.name, searchQuery)}
                    </Text>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg leading-none">
                      {getCountryFlag(city.country)}
                    </span>

                    <Text size="sm" variant="muted" className="truncate">
                      {city.state ? `${city.state}, ` : ""}
                      {city.country}
                    </Text>
                    {city.population && city.population > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <Text size="sm" variant="muted">
                          {city.population.toLocaleString()} people
                        </Text>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional city info */}

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {city.timezone && (
                    <Text size="xs" variant="subtle">
                      {city.timezone}
                    </Text>
                  )}
                  {city.coordinates && (
                    <Text size="xs" variant="subtle" className="font-mono">
                      {city.coordinates.lat.toFixed(2)},{" "}
                      {city.coordinates.lon.toFixed(2)}
                    </Text>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Show "more results" indicator if there are additional suggestions */}
        {suggestions.length > maxItems && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <Text size="sm" variant="muted" align="center">
              +{suggestions.length - maxItems} more results available
            </Text>
          </div>
        )}

        {/* Footer with search tip */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <Text size="xs" variant="subtle" align="center">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </Text>
        </div>
      </div>
    );
  },
);

SuggestionList.displayName = "SuggestionList";
