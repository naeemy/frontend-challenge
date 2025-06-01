"use client";

import { useState, useEffect, useCallback } from "react";

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  isLoading: boolean;

  error: string | null;
  isSupported: boolean;
  permission: PermissionState | null;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  onSuccess?: (coordinates: GeolocationCoordinates) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for accessing user's geolocation with comprehensive error handling
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    watch = false,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    isLoading: false,
    error: null,

    isSupported: typeof navigator !== "undefined" && "geolocation" in navigator,

    permission: null,
  });

  // Check if geolocation is supported
  const isSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  // Get current position
  const getCurrentPosition =
    useCallback(async (): Promise<GeolocationCoordinates | null> => {
      if (!isSupported) {
        const error = "Geolocation is not supported by this browser";
        setState((prev) => ({ ...prev, error, isLoading: false }));
        onError?.(error);
        return null;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy,
              timeout,
              maximumAge,
            });
          },
        );

        const coordinates: GeolocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,

          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };

        setState((prev) => ({
          ...prev,
          coordinates,
          isLoading: false,
          error: null,
        }));

        onSuccess?.(coordinates);
        return coordinates;
      } catch (error) {
        const errorMessage = getGeolocationErrorMessage(
          error as GeolocationPositionError,
        );

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        onError?.(errorMessage);
        return null;
      }
    }, [
      isSupported,
      enableHighAccuracy,
      timeout,
      maximumAge,
      onSuccess,
      onError,
    ]);

  // Watch position changes
  const watchPosition = useCallback(() => {
    if (!isSupported) return null;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates: GeolocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };

        setState((prev) => ({
          ...prev,
          coordinates,
          isLoading: false,
          error: null,
        }));

        onSuccess?.(coordinates);
      },
      (error) => {
        const errorMessage = getGeolocationErrorMessage(error);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        onError?.(errorMessage);
      },
      {
        enableHighAccuracy,

        timeout,
        maximumAge,
      },
    );

    return watchId;
  }, [
    isSupported,
    enableHighAccuracy,
    timeout,
    maximumAge,
    onSuccess,
    onError,
  ]);

  // Stop watching position
  const clearWatch = useCallback(
    (watchId: number) => {
      if (isSupported && watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    },
    [isSupported],
  );

  // Check permission status
  const checkPermission =
    useCallback(async (): Promise<PermissionState | null> => {
      if (!isSupported || !navigator.permissions) {
        return null;
      }

      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        setState((prev) => ({ ...prev, permission: permission.state }));

        // Listen for permission changes

        permission.addEventListener("change", () => {
          setState((prev) => ({ ...prev, permission: permission.state }));
        });

        return permission.state;
      } catch (error) {
        console.warn("Error checking geolocation permission:", error);
        return null;
      }
    }, [isSupported]);

  // Request permission and get location
  const requestLocation =
    useCallback(async (): Promise<GeolocationCoordinates | null> => {
      await checkPermission();
      return getCurrentPosition();
    }, [checkPermission, getCurrentPosition]);

  // Effect for watching position
  useEffect(() => {
    if (!watch) return;

    const watchId = watchPosition();

    return () => {
      if (watchId) {
        clearWatch(watchId);
      }
    };
  }, [watch, watchPosition, clearWatch]);

  // Effect for checking permission on mount
  useEffect(() => {
    if (isSupported) {
      checkPermission();
    }
  }, [isSupported, checkPermission]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    checkPermission,
    requestLocation,
  };
}

/**
 * Hook for getting distance between two coordinates
 */
export function useGeolocationUtils() {
  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback(
    (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
      unit: "km" | "mi" = "km",
    ): number => {
      const R = unit === "km" ? 6371 : 3959; // Earth's radius in km or miles
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  // Convert degrees to radians
  const toRadians = useCallback((degrees: number): number => {
    return degrees * (Math.PI / 180);
  }, []);

  // Format distance with appropriate units

  const formatDistance = useCallback(
    (distance: number, unit: "km" | "mi" = "km"): string => {
      if (distance < 1) {
        const meters = Math.round(distance * (unit === "km" ? 1000 : 5280));
        return `${meters} ${unit === "km" ? "m" : "ft"}`;
      }

      if (distance < 10) {
        return `${distance.toFixed(1)} ${unit}`;
      }

      return `${Math.round(distance)} ${unit}`;
    },
    [],
  );

  return {
    calculateDistance,
    formatDistance,
  };
}

// Helper function to convert GeolocationPositionError to user-friendly message
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access denied by user";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable";
    case error.TIMEOUT:
      return "Location request timed out";
    default:
      return `An unknown error occurred: ${error.message}`;
  }
}
