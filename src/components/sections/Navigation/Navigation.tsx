"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button, Text, Icon } from "@/components/ui";
import { TemperatureUnitSelector } from "@/components/features";
import { useTemperatureUnit } from "@/hooks";
import { clsx } from "clsx";

export interface NavigationProps {
  className?: string;
}

export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ className }, ref) => {
    const router = useRouter();
    const pathname = usePathname();
    const { unit, setUnit } = useTemperatureUnit();

    const isActive = (path: string) => {
      if (path === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(path);
    };

    const navigationItems = [
      {
        href: "/",
        label: "My Cities",
        icon: "location" as const,
        active: isActive("/") && pathname !== "/search",
      },

      {
        href: "/search",
        label: "Add City",
        icon: "search" as const,
        active: isActive("/search"),
      },
    ];

    return (
      <nav
        ref={ref}
        className={clsx(
          "sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200",
          className,
        )}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Icon name="cloud" size="sm" variant="white" />
              </div>
              <Text
                size="lg"
                weight="bold"
                className="text-gray-900 hidden sm:block"
              >
                Weather App
              </Text>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.active ? "primary" : "ghost"}
                    size="sm"
                    className={clsx(
                      "flex items-center gap-2 transition-all",
                      item.active && "shadow-sm",
                    )}
                  >
                    <Icon name={item.icon} size="sm" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              {/* Temperature Unit Selector */}

              <div className="hidden sm:block">
                <TemperatureUnitSelector
                  value={unit}
                  onChange={setUnit}
                  variant="toggle"
                  size="sm"
                />
              </div>

              {/* Mobile Navigation Toggle */}
              <div className="md:hidden">
                <MobileNavigationMenu
                  navigationItems={navigationItems}
                  unit={unit}
                  onUnitChange={setUnit}
                />
              </div>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="md:hidden border-t border-gray-100 py-2">
            <div className="flex items-center justify-center gap-1">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href} className="flex-1">
                  <Button
                    variant={item.active ? "primary" : "ghost"}
                    size="sm"
                    className={clsx(
                      "w-full flex flex-col items-center gap-1 py-2 h-auto",

                      item.active && "shadow-sm",
                    )}
                  >
                    <Icon name={item.icon} size="sm" />

                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  },
);

Navigation.displayName = "Navigation";

// Mobile navigation menu component
interface MobileNavigationMenuProps {
  navigationItems: Array<{
    href: string;
    label: string;
    icon: any;

    active: boolean;
  }>;

  unit: any;
  onUnitChange: (unit: any) => void;
}

const MobileNavigationMenu: React.FC<MobileNavigationMenuProps> = ({
  navigationItems,

  unit,
  onUnitChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        <Icon name={isOpen ? "close" : "settings"} size="sm" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-2 z-50">
          {/* Navigation Items */}
          <div className="px-2 pb-2 border-b border-gray-100">
            <Text size="xs" weight="medium" className="text-gray-500 px-2 py-1">
              Navigation
            </Text>
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-full justify-start gap-2 mb-1"
                >
                  <Icon name={item.icon} size="sm" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Settings */}
          <div className="px-2 pt-2">
            <Text size="xs" weight="medium" className="text-gray-500 px-2 py-1">
              Settings
            </Text>
            <div className="px-2">
              <TemperatureUnitSelector
                value={unit}
                onChange={onUnitChange}
                variant="buttons"
                size="sm"
                showLabel
                label="Temperature"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Breadcrumb navigation for detail pages
export interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  className?: string;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, className }, ref) => {
    return (
      <nav ref={ref} className={clsx("flex items-center gap-2", className)}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <Icon name={"chevron-right" as any} size="xs" variant="muted" />
            )}
            {item.href && !item.active ? (
              <Link
                href={item.href}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <Text
                size="sm"
                variant={item.active ? ("default" as any) : ("muted" as any)}
                weight={item.active ? "medium" : "normal"}
              >
                {item.label}
              </Text>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  },
);

Breadcrumb.displayName = "Breadcrumb";
