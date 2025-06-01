import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const inputVariants = cva(
  "w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",

        error: "border-red-300 focus:border-red-500 focus:ring-red-500",
        success: "border-green-300 focus:border-green-500 focus:ring-green-500",
        warning:
          "border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500",
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

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;

  rightIcon?: React.ReactNode;
  loading?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type = "text",
      label,
      error,

      success,
      hint,
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isDisabled = disabled || loading;

    // Determine variant based on state
    const computedVariant = error ? "error" : success ? "success" : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={clsx(
              inputVariants({ variant: computedVariant, size }),

              leftIcon && "pl-10",
              (rightIcon || loading) && "pr-10",
              className,
            )}
            ref={ref}
            disabled={isDisabled}
            id={inputId}
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <svg
                className="h-4 w-4 animate-spin text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : rightIcon ? (
              <div className="text-gray-400">{rightIcon}</div>
            ) : null}
          </div>
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

Input.displayName = "Input";
