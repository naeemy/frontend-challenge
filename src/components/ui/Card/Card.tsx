import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const cardVariants = cva(
  "rounded-xl border bg-white shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        outlined: "border-gray-300 shadow-none",
        elevated: "border-gray-100 shadow-lg",
        interactive:
          "border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer",
        weather: "border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50",
        success: "border-green-200 bg-green-50",
        warning: "border-yellow-200 bg-yellow-50",
        error: "border-red-200 bg-red-50",
        ghost: "border-transparent shadow-none bg-transparent",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;

  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant, size, padding, children, asChild = false, ...props },
    ref,
  ) => {
    const Component = asChild ? React.Fragment : "div";
    const cardProps = asChild ? {} : props;

    return (
      <Component>
        <div
          className={clsx(
            cardVariants({ variant, size: (padding as any) || size }),
            className,
          )}
          ref={ref}
          {...cardProps}
        >
          {children}
        </div>
      </Component>
    );
  },
);

Card.displayName = "Card";

// Card sub-components for better composition
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx(
      "text-lg font-semibold leading-none tracking-tight text-gray-900",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx("text-sm text-gray-600", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
