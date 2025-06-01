import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const textVariants = cva("", {
  variants: {
    variant: {
      body: "text-gray-900",
      muted: "text-gray-600",
      subtle: "text-gray-500",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
      info: "text-blue-600",
      heading: "text-gray-900 font-semibold",
      subheading: "text-gray-700 font-medium",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",

      justify: "text-justify",
    },
  },
  defaultVariants: {
    variant: "body",
    size: "md",
    weight: "normal",
    align: "left",
  },
});

type TextElement =
  | "p"
  | "span"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "label"
  | "caption";

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  children: React.ReactNode;

  as?: TextElement;
  truncate?: boolean;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      variant,
      size,
      weight,
      align,
      as: Component = "p",
      truncate = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Element = Component as any;

    return (
      <Element
        className={clsx(
          textVariants({ variant, size, weight, align }),
          truncate && "truncate",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Element>
    );
  },
);

Text.displayName = "Text";
