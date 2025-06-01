"use client";

import React, { useState, useRef, useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Icon } from "../Icon";

const selectVariants = cva(
  "relative w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        error: "border-red-300 focus:border-red-500 focus:ring-red-500",
        success: "border-green-300 focus:border-green-500 focus:ring-green-500",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;

  icon?: React.ReactNode;
}

export interface SelectProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "onChange" | "value"
    >,
    VariantProps<typeof selectVariants> {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      variant,
      size,
      options,
      value,
      onChange,
      placeholder = "Select an option...",

      label,
      error,
      success,
      hint,
      searchable = false,
      clearable = false,
      loading = false,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Find selected option
    const selectedOption = options.find((option) => option.value === value);

    // Filter options based on search term
    const filteredOptions = searchable
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : options;

    // Close dropdown when clicking outside

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleToggle = () => {
      if (!disabled && !loading) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          setSearchTerm("");
        }
      }
    };

    const handleOptionSelect = (option: SelectOption) => {
      if (!option.disabled && onChange) {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();

      if (onChange) {
        onChange("");
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      } else if (e.key === "ArrowDown" && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    const computedVariant = error ? "error" : success ? "success" : variant;

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <button
            ref={ref}
            type="button"
            className={clsx(
              selectVariants({ variant: computedVariant, size }),
              "flex w-full items-center justify-between text-left",

              !selectedOption && "text-gray-500",

              className,
            )}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            id={selectId}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            {...props}
          >
            <span className="flex items-center gap-2 flex-1 truncate">
              {selectedOption?.icon && (
                <span className="flex-shrink-0">{selectedOption.icon}</span>
              )}
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <div className="flex items-center gap-1 flex-shrink-0">
              {loading ? (
                <Icon name="refresh" size="sm" className="animate-spin" />
              ) : (
                <>
                  {clearable && selectedOption && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-0.5 hover:bg-gray-100 rounded"
                      tabIndex={-1}
                    >
                      <Icon name="close" size="xs" />
                    </button>
                  )}
                  <Icon
                    name="chevron-down"
                    size="sm"
                    className={clsx(
                      "transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </>
              )}
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
              {searchable && (
                <div className="border-b border-gray-100 p-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full rounded border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              <div className="max-h-60 overflow-auto py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {searchTerm ? "No options found" : "No options available"}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={clsx(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                        option.disabled
                          ? "cursor-not-allowed text-gray-400"
                          : "hover:bg-gray-50",
                        option.value === value && "bg-blue-50 text-blue-600",
                      )}
                      onClick={() => handleOptionSelect(option)}
                      disabled={option.disabled}
                    >
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}
                      {option.label}
                      {option.value === value && (
                        <Icon name="check" size="sm" className="ml-auto" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {(error || success || hint) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-green-600">{success}</p>
            )}
            {hint && !error && !success && (
              <p className="text-sm text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
