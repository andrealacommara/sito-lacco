// ========================== MAIN IMPORTS ========================== //
import { FC, useState, useEffect } from "react"; // React functional component and hooks
import { VisuallyHidden } from "@react-aria/visually-hidden"; // Hidden label for accessibility
import clsx from "clsx"; // Utility to combine class names conditionally

import { SunFilledIcon, MoonFilledIcon } from "@/components/icons"; // Theme icons (sun and moon)

// ========================== PROPS AND CONSTANTS ========================== //

// Defines the props accepted by ThemeSwitch component
export interface ThemeSwitchProps {
  className?: string; // Optional external wrapper class
}

// Maximum duration for saved theme (24 hours)
const THEME_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// ========================== UTILS ========================== //
const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("user-theme");
  const timestamp = localStorage.getItem("user-theme-timestamp");

  if (saved && timestamp) {
    const expired = Date.now() - parseInt(timestamp, 10) > THEME_EXPIRATION_MS;

    if (!expired) return saved as "light" | "dark";

    localStorage.removeItem("user-theme");
    localStorage.removeItem("user-theme-timestamp");
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const followsSystemByDefault = (): boolean => {
  if (typeof window === "undefined") return true;

  return !localStorage.getItem("user-theme");
};

// ========================== MAIN COMPONENT ========================== //

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const isBrowser = typeof window !== "undefined";
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());
  const [followsSystem, setFollowsSystem] = useState(() =>
    followsSystemByDefault(),
  );

  // Apply theme to the document via the `data-theme` attribute (HeroUI v3)
  useEffect(() => {
    if (!isBrowser) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, isBrowser]);

  // Follow system theme changes if no manual preference is stored
  useEffect(() => {
    if (!isBrowser || !followsSystem) return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? "dark" : "light");

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [followsSystem, isBrowser]);

  // Toggle theme manually
  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    setFollowsSystem(false);

    if (isBrowser) {
      localStorage.setItem("user-theme", newTheme);
      localStorage.setItem("user-theme-timestamp", Date.now().toString());
    }
  };

  if (!isBrowser) return <div className="w-6 h-6" />;

  const isLight = theme === "light";

  // ========================== RENDER ========================== //

  return (
    <button
      aria-label={isLight ? "Passa al tema scuro" : "Passa al tema chiaro"}
      className={clsx(
        "px-px transition-opacity hover:opacity-80 cursor-pointer",
        "flex items-center justify-center bg-transparent text-default-500",
        className,
      )}
      type="button"
      onClick={handleThemeChange}
    >
      <VisuallyHidden>
        {isLight ? "Tema chiaro attivo" : "Tema scuro attivo"}
      </VisuallyHidden>

      {isLight ? (
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
    </button>
  );
};
