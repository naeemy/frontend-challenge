"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing localStorage with type safety and error handling
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);

      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function to match useState API
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(
            `Error parsing localStorage value for key "${key}":`,
            error,
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing localStorage with additional features like expiration
 */
export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expiryInMinutes?: number,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  // Wrapper to handle expiry
  const setValueWithExpiry = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      if (!expiryInMinutes) {
        setValue(newValue);
        return;
      }

      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;
      const expiryTime = Date.now() + expiryInMinutes * 60 * 1000;

      const dataWithExpiry = {
        value: valueToStore,
        expiry: expiryTime,
      };

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(key, JSON.stringify(dataWithExpiry));
          setValue(valueToStore);
        } catch (error) {
          console.warn(
            `Error setting localStorage with expiry for key "${key}":`,
            error,
          );
        }
      }
    },
    [key, expiryInMinutes, value, setValue],
  );

  // Check expiry on mount and periodically
  useEffect(() => {
    if (typeof window === "undefined" || !expiryInMinutes) return;

    const checkExpiry = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const { value: storedValue, expiry } = JSON.parse(item);

          if (Date.now() > expiry) {
            removeValue();
          } else {
            setValue(storedValue);
          }
        }
      } catch (error) {
        console.warn(`Error checking expiry for key "${key}":`, error);

        removeValue();
      }
    };

    checkExpiry();

    // Check expiry every minute
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [key, expiryInMinutes, setValue, removeValue]);

  return [value, setValueWithExpiry, removeValue];
}

/**
 * Hook for managing multiple localStorage keys as a group
 */
export function useLocalStorageState<T extends Record<string, any>>(
  keyPrefix: string,

  initialState: T,
): [T, (updates: Partial<T>) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialState;
    }

    const loadedState = { ...initialState };

    Object.keys(initialState).forEach((key) => {
      try {
        const item = window.localStorage.getItem(`${keyPrefix}_${key}`);
        if (item) {
          loadedState[key as keyof T] = JSON.parse(item);
        }
      } catch (error) {
        console.warn(
          `Error loading state for key "${keyPrefix}_${key}":`,
          error,
        );
      }
    });

    return loadedState;
  });

  const updateState = useCallback(
    (updates: Partial<T>) => {
      setState((prevState) => {
        const newState = { ...prevState, ...updates };

        // Save each updated key to localStorage
        Object.entries(updates).forEach(([key, value]) => {
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(
                `${keyPrefix}_${key}`,
                JSON.stringify(value),
              );
            }
          } catch (error) {
            console.warn(
              `Error saving state for key "${keyPrefix}_${key}":`,
              error,
            );
          }
        });

        return newState;
      });
    },
    [keyPrefix],
  );

  const clearState = useCallback(() => {
    setState(initialState);

    Object.keys(initialState).forEach((key) => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(`${keyPrefix}_${key}`);
        }
      } catch (error) {
        console.warn(
          `Error clearing state for key "${keyPrefix}_${key}":`,
          error,
        );
      }
    });
  }, [keyPrefix, initialState]);

  return [state, updateState, clearState];
}
