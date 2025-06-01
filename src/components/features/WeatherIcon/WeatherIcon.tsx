import React from "react";
import { Icon } from "@/components/ui";
import { clsx } from "clsx";

export interface WeatherIconProps {
  condition: string;
  icon?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
  useOpenWeatherIcon?: boolean;
}

// Map weather conditions to local icons
const conditionIconMap: Record<string, string> = {
  // Clear/Sunny
  clear: "sun",

  sunny: "sun",
  "clear sky": "sun",

  // Clouds
  clouds: "cloud",
  cloudy: "cloud",
  "partly cloudy": "cloud",
  "scattered clouds": "cloud",
  "few clouds": "cloud",
  "broken clouds": "cloud",
  "overcast clouds": "cloud",

  // Rain
  rain: "rain",
  "light rain": "rain",
  "moderate rain": "rain",
  "heavy rain": "rain",
  "shower rain": "rain",
  drizzle: "rain",

  // Snow

  snow: "snow",
  "light snow": "snow",

  "heavy snow": "snow",

  // Thunderstorm
  thunderstorm: "storm",
  storm: "storm",

  // Night
  night: "moon",
  "clear night": "moon",
};

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

export const WeatherIcon = React.forwardRef<HTMLDivElement, WeatherIconProps>(
  (
    {
      condition,
      icon,
      size = "md",
      animated = false,
      className,
      useOpenWeatherIcon = true,
    },
    ref,
  ) => {
    const normalizedCondition = condition.toLowerCase();

    // Find matching icon from condition
    const getIconName = () => {
      for (const [key, iconName] of Object.entries(conditionIconMap)) {
        if (normalizedCondition.includes(key)) {
          return iconName;
        }
      }
      return "cloud"; // Default fallback
    };

    const iconName = getIconName();

    // Animation classes for weather icons
    const getAnimationClass = () => {
      if (!animated) return "";

      switch (iconName) {
        case "sun":
          return "animate-spin";
        case "rain":
          return "animate-bounce";
        case "snow":
          return "animate-pulse";
        case "storm":
          return "animate-ping";
        default:
          return "";
      }
    };

    // Color classes based on weather condition

    const getColorClass = () => {
      switch (iconName) {
        case "sun":
          return "text-yellow-500";
        case "moon":
          return "text-indigo-400";
        case "cloud":
          return "text-gray-500";
        case "rain":
          return "text-blue-500";
        case "snow":
          return "text-gray-300";
        case "storm":
          return "text-purple-600";
        default:
          return "text-gray-500";
      }
    };

    // If we have an OpenWeather icon code and want to use it
    if (useOpenWeatherIcon && icon) {
      const openWeatherIconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      return (
        <div
          ref={ref}
          className={clsx(
            "flex items-center justify-center",
            sizeMap[size],
            className,
          )}
        >
          <img
            src={openWeatherIconUrl}
            alt={condition}
            className={clsx(
              "w-full h-full object-contain",
              animated && getAnimationClass(),
            )}
            loading="lazy"
            onError={(e) => {
              // Fallback to local icon if OpenWeather icon fails
              e.currentTarget.style.display = "none";
              const fallbackIcon = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (fallbackIcon) {
                fallbackIcon.style.display = "block";
              }
            }}
          />

          {/* Fallback local icon (hidden by default) */}
          <div
            style={{ display: "none" }}
            className={clsx("w-full h-full", getColorClass())}
          >
            <Icon
              name={iconName as any}
              className={clsx(
                "w-full h-full",

                animated && getAnimationClass(),
              )}
            />
          </div>
        </div>
      );
    }

    // Use local icon
    return (
      <div
        ref={ref}
        className={clsx(
          "flex items-center justify-center",
          sizeMap[size],
          getColorClass(),
          className,
        )}
      >
        <Icon
          name={iconName as any}
          className={clsx("w-full h-full", animated && getAnimationClass())}
        />
      </div>
    );
  },
);

WeatherIcon.displayName = "WeatherIcon";

// Preset weather icons for common conditions
export const SunnyIcon = (props: Omit<WeatherIconProps, "condition">) => (
  <WeatherIcon condition="sunny" {...props} />
);

export const CloudyIcon = (props: Omit<WeatherIconProps, "condition">) => (
  <WeatherIcon condition="cloudy" {...props} />
);

export const RainyIcon = (props: Omit<WeatherIconProps, "condition">) => (
  <WeatherIcon condition="rain" {...props} />
);

export const SnowyIcon = (props: Omit<WeatherIconProps, "condition">) => (
  <WeatherIcon condition="snow" {...props} />
);

export const StormyIcon = (props: Omit<WeatherIconProps, "condition">) => (
  <WeatherIcon condition="storm" {...props} />
);

export const NightIcon = (props: Omit<WeatherIconProps, "condition">) => (
  <WeatherIcon condition="night" {...props} />
);
