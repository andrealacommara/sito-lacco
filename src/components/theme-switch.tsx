import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import clsx from "clsx";
import { useTheme } from "@heroui/use-theme";
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

const THEME_EXPIRATION_MS = 24 * 60 * 60 * 1000;

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className, classNames }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timestamp = localStorage.getItem("user-theme-timestamp");
    const expired = timestamp && Date.now() - parseInt(timestamp) > THEME_EXPIRATION_MS;

    if (expired) {
      localStorage.removeItem("user-theme");
      localStorage.removeItem("user-theme-timestamp");

      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, [setTheme]);

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("user-theme", newTheme);
    localStorage.setItem("user-theme-timestamp", Date.now().toString());
  };

  const { Component, slots, isSelected, getBaseProps, getInputProps, getWrapperProps } =
    useSwitch({
      isSelected: theme === "light",
      onChange: handleThemeChange,
    });

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return <div className="w-6 h-6" />;

  return (
    <Component
      aria-label={isSelected ? "Switch to dark mode" : "Switch to light mode"}
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity hover:opacity-80 cursor-pointer",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: clsx(
            "w-auto h-auto bg-transparent rounded-lg flex items-center justify-center",
            "group-data-[selected=true]:bg-transparent !text-default-500 pt-px px-0 mx-0",
            classNames?.wrapper,
          ),
        })}
      >
        {isSelected ? <MoonFilledIcon size={22} /> : <SunFilledIcon size={22} />}
      </div>
    </Component>
  );
};
