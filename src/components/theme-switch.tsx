// ========================== MAIN IMPORTS ========================== //
import { FC, useState, useEffect } from "react"; // React functional component and hooks
import { VisuallyHidden } from "@react-aria/visually-hidden"; // Hidden input for accessibility
import { SwitchProps, useSwitch } from "@heroui/switch"; // HeroUI switch component and types
import clsx from "clsx"; // Utility to combine class names conditionally
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons"; // Theme icons (sun and moon)

// ========================== PROPS AND CONSTANTS ========================== //

// Defines the props accepted by ThemeSwitch component
export interface ThemeSwitchProps {
  className?: string; // Optional external wrapper class
  classNames?: SwitchProps["classNames"]; // Optional HeroUI switch classes
}

// Maximum duration for saved theme (24 hours)
const THEME_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// ========================== MAIN COMPONENT ========================== //

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  // State to indicate if component has mounted (important for SSR/CSR)
  const [isMounted, setIsMounted] = useState(false);

  // ========================== THEME LOGIC ========================== //

  // Determines initial theme
  const getInitialTheme = (): "light" | "dark" => {
    const saved = localStorage.getItem("user-theme");
    const timestamp = localStorage.getItem("user-theme-timestamp");

    if (saved && timestamp) {
      const expired = Date.now() - parseInt(timestamp) > THEME_EXPIRATION_MS;
      if (!expired) return saved as "light" | "dark";
    }

    // Default to system preference if no valid theme saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Check if saved theme has expired
  useEffect(() => {
    const timestamp = localStorage.getItem("user-theme-timestamp");
    const expired =
      timestamp && Date.now() - parseInt(timestamp) > THEME_EXPIRATION_MS;

    if (expired) {
      localStorage.removeItem("user-theme");
      localStorage.removeItem("user-theme-timestamp");

      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Follow system theme changes if user hasn't chosen manually
  useEffect(() => {
    const saved = localStorage.getItem("user-theme");
    if (!saved) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) =>
        setTheme(e.matches ? "dark" : "light");

      setTheme(mediaQuery.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Toggle theme manually
  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("user-theme", newTheme);
    localStorage.setItem("user-theme-timestamp", Date.now().toString());
  };

  // ========================== HEROUI SWITCH HOOK ========================== //

  const {
    Component, // Switch wrapper component
    slots, // Auto-generated class slots
    isSelected, // Selected state (true = light mode)
    getBaseProps, // Base props for switch
    getInputProps, // Props for hidden input
    getWrapperProps, // Props for visual wrapper
  } = useSwitch({
    isSelected: theme === "light",
    onChange: handleThemeChange,
  });

  // Mark component as mounted
  useEffect(() => setIsMounted(true), []);

  // Avoid hydration issues
  if (!isMounted) return <div className="w-6 h-6" />;

  // ========================== RENDER ========================== //

  return (
    <Component
      aria-label={isSelected ? "Switch to dark mode" : "Switch to light mode"}
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity hover:opacity-80 cursor-pointer",
          className,
          classNames?.base
        ),
      })}
    >
      {/* Hidden input for accessibility */}
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      {/* Visual switch wrapper */}
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: clsx(
            "w-auto h-auto bg-transparent rounded-lg flex items-center justify-center",
            "group-data-[selected=true]:bg-transparent text-default-500! pt-px px-0 mx-0",
            classNames?.wrapper
          ),
        })}
      >
        {/* Conditional icon based on theme */}
        {isSelected ? (
          <MoonFilledIcon
            className="transition-colors duration-300 hover:text-danger dark:hover:text-danger"
            size={24}
          />
        ) : (
          <SunFilledIcon
            className="transition-colors duration-300 hover:text-danger dark:hover:text-danger"
            size={24}
          />
        )}
      </div>
    </Component>
  );
};
