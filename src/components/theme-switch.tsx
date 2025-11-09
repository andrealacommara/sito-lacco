import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import clsx from "clsx";

import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

// ========================== PROPS E COSTANTI ========================== //

// Definisce le proprietà accettate dal componente ThemeSwitch.
// Permette di personalizzare le classi di stile esterne e interne.
export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

// Durata massima di validità del tema salvato (24 ore)
const THEME_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// ========================== COMPONENTE PRINCIPALE ========================== //

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  // Stato che indica se il componente è montato (necessario per SSR/CSR)
  const [isMounted, setIsMounted] = useState(false);

  // Gestione tema manuale
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("user-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Aggiorna classe del documento quando cambia il tema
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Controlla scadenza del tema salvato
  useEffect(() => {
    const timestamp = localStorage.getItem("user-theme-timestamp");
    const expired =
      timestamp && Date.now() - parseInt(timestamp) > THEME_EXPIRATION_MS;

    // Se il salvataggio è scaduto, resetta il tema e applica la preferenza di sistema
    if (expired) {
      localStorage.removeItem("user-theme");
      localStorage.removeItem("user-theme-timestamp");

      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Funzione per alternare il tema
  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("user-theme", newTheme);
    localStorage.setItem("user-theme-timestamp", Date.now().toString());
  };

  // Hook di HeroUI che fornisce logica e accessibilità per lo switch
  const {
    Component, // Componente wrapper dello switch
    slots, // Classi di stile generate automaticamente
    isSelected, // Stato selezionato (true = tema chiaro)
    getBaseProps, // Props di base per lo switch
    getInputProps, // Props per l'input nascosto
    getWrapperProps, // Props per il wrapper visivo
  } = useSwitch({
    isSelected: theme === "light",
    onChange: handleThemeChange,
  });

  // Imposta lo stato montato una volta che il componente è pronto
  useEffect(() => setIsMounted(true), []);

  // Evita problemi di idratazione durante il rendering lato client
  if (!isMounted) return <div className="w-6 h-6" />;

  // ========================== RENDERING ========================== //

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
      {/* Input nascosto per l’accessibilità */}
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      {/* Wrapper visivo del pulsante di switch */}
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
        {/* Icona condizionale in base al tema corrente */}
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
