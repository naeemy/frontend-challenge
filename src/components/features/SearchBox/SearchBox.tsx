"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input, Icon, LoadingSpinner } from "@/components/ui";
import { SuggestionList } from "../SuggestionList";
import { useCitySearch } from "@/hooks";
import { clsx } from "clsx";
import type { City } from "@/types/location";

export interface SearchBoxProps {
  value?: string;
  onChange?: (value: string) => void;
  onCitySelect?: (city: City) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  (
    {
      value: controlledValue,
      onChange,
      onCitySelect,
      placeholder = "Search for a city...",
      showSuggestions = true,
      autoFocus = false,

      className,
      size = "md",
      disabled = false,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use controlled or uncontrolled value
    const value =
      controlledValue !== undefined ? controlledValue : internalValue;
    const setValue =
      controlledValue !== undefined ? onChange : setInternalValue;

    const { suggestions, isLoading, error, searchCities, clearSuggestions } =
      useCitySearch();

    // Debounced search effect
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (value.trim().length >= 2) {
          searchCities(value.trim());
          if (showSuggestions) {
            setShowDropdown(true);
          }
        } else {
          clearSuggestions();
          setShowDropdown(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }, [value, searchCities, clearSuggestions, showSuggestions]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setShowDropdown(false);
          setFocusedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset focused index when suggestions change
    useEffect(() => {
      setFocusedIndex(-1);
    }, [suggestions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue?.(newValue);

      setFocusedIndex(-1);
    };

    const handleInputFocus = () => {
      if (suggestions.length > 0 && showSuggestions) {
        setShowDropdown(true);
      }
    };

    const handleCitySelect = (city: City) => {
      setValue?.(city.name);
      setShowDropdown(false);
      setFocusedIndex(-1);
      onCitySelect?.(city);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );

          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
            handleCitySelect(suggestions[focusedIndex]!);
          }
          break;
        case "Escape":
          setShowDropdown(false);
          setFocusedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    const handleClear = () => {
      setValue?.("");
      setShowDropdown(false);
      setFocusedIndex(-1);
      clearSuggestions();
      inputRef.current?.focus();
    };

    return (
      <div className={clsx("relative w-full", className)} ref={containerRef}>
        <Input
          ref={(node) => {
            //inputRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          size={size as any}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          leftIcon={<Icon name="search" size="sm" />}
          rightIcon={
            <div className="flex items-center gap-1">
              {isLoading && <LoadingSpinner size="sm" />}
              {value && !isLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                  tabIndex={-1}
                >
                  <Icon name="close" size="xs" />
                </button>
              )}
            </div>
          }
          error={error as any}
        />

        {/* Suggestions Dropdown */}
        {showDropdown && showSuggestions && (
          <div className="absolute z-50 mt-1 w-full">
            {suggestions.length > 0 ? (
              <SuggestionList
                suggestions={suggestions}
                onSelect={handleCitySelect}
                searchQuery={value}
                focusedIndex={focusedIndex}
                onFocusChange={setFocusedIndex}
              />
            ) : (
              value.trim().length >= 2 &&
              !isLoading && (
                <div className="rounded-lg border border-gray-200 bg-white shadow-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Icon name="search" size="sm" />
                    <span className="text-sm">
                      No cities found for "{value}"
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  },
);
("playwright.config.ts");

SearchBox.displayName = "SearchBox";
