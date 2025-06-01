import React from "react";
import { Select, Button, Icon } from "@/components/ui";
import { clsx } from "clsx";
import type { TemperatureUnit } from "@/types/settings";
import type { SelectOption } from "@/components/ui/Select";

export interface TemperatureUnitSelectorProps {
  value: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
  variant?: "select" | "toggle" | "buttons";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  label?: string;
  showLabel?: boolean;
}

const temperatureOptions: SelectOption[] = [
  {
    value: "celsius",
    label: "Celsius (°C)",
    icon: <span className="text-blue-600">°C</span>,
  },
  {
    value: "fahrenheit",
    label: "Fahrenheit (°F)",
    icon: <span className="text-red-600">°F</span>,
  },
];

export const TemperatureUnitSelector = React.forwardRef<
  HTMLDivElement,
  TemperatureUnitSelectorProps
>(
  (
    {
      value,

      onChange,
      variant = "select",
      size = "md",
      className,

      disabled = false,

      label = "Temperature Unit",
      showLabel = false,
    },
    ref,
  ) => {
    const handleChange = (newValue: string | number) => {
      onChange(newValue as TemperatureUnit);
    };

    const toggleUnit = () => {
      onChange(value === "celsius" ? "fahrenheit" : "celsius");
    };

    if (variant === "toggle") {
      return (
        <div ref={ref} className={clsx("flex flex-col gap-1", className)}>
          {showLabel && (
            <label className="text-sm font-medium text-gray-700">{label}</label>
          )}

          <Button
            variant="outline"
            size={size}
            onClick={toggleUnit}
            disabled={disabled}
            className="relative overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Icon name="temperature" size="sm" />
              <span className="font-mono">
                {value === "celsius" ? "°C" : "°F"}
              </span>
            </div>
          </Button>
        </div>
      );
    }

    if (variant === "buttons") {
      return (
        <div ref={ref} className={clsx("flex flex-col gap-2", className)}>
          {showLabel && (
            <label className="text-sm font-medium text-gray-700">{label}</label>
          )}

          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={value === "celsius" ? "primary" : "ghost"}
              size="sm"
              onClick={() => onChange("celsius")}
              disabled={disabled}
              className={clsx(
                "flex-1 font-mono transition-all",
                value === "celsius" ? "shadow-sm" : "hover:bg-white/50",
              )}
            >
              °C
            </Button>
            <Button
              variant={value === "fahrenheit" ? "primary" : "ghost"}
              size="sm"
              onClick={() => onChange("fahrenheit")}
              disabled={disabled}
              className={clsx(
                "flex-1 font-mono transition-all",
                value === "fahrenheit" ? "shadow-sm" : "hover:bg-white/50",
              )}
            >
              °F
            </Button>
          </div>
        </div>
      );
    }

    // Default: select variant
    return (
      <div ref={ref} className={className}>
        <Select
          options={temperatureOptions}
          value={value}
          onChange={handleChange}
          size={size}
          disabled={disabled}
          label={showLabel ? label : undefined}
          placeholder="Select unit..."
        />
      </div>
    );
  },
);

TemperatureUnitSelector.displayName = "TemperatureUnitSelector";

// Preset selectors for common use cases
export const CompactUnitSelector = (
  props: Omit<TemperatureUnitSelectorProps, "variant" | "size">,
) => <TemperatureUnitSelector variant="toggle" size="sm" {...props} />;

export const ButtonUnitSelector = (
  props: Omit<TemperatureUnitSelectorProps, "variant">,
) => <TemperatureUnitSelector variant="buttons" {...props} />;

export const DropdownUnitSelector = (
  props: Omit<TemperatureUnitSelectorProps, "variant">,
) => <TemperatureUnitSelector variant="select" {...props} />;
