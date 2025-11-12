// ========================== MAIN IMPORTS ========================== //
// Core imports for navigation, routing, styling, state management, and icons.
// HeroUI components are used for building a responsive Navbar.
// React Router handles route tracking. clsx manages conditional class names.

import { Link } from "@heroui/link"; // HeroUI component for navigation links
import { useLocation } from "react-router-dom"; // React Router hook to get the current route
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar"; // HeroUI Navbar components for desktop and mobile navigation
import { link as linkStyles } from "@heroui/theme"; // Utility function for consistent link styling
import clsx from "clsx"; // Utility to combine and conditionally apply CSS class names

import { siteConfig } from "@/config/site"; // App configuration including navbar items
import { ThemeSwitch } from "@/components/theme-switch"; // Toggle component for light/dark theme
import { Logo } from "@/components/icons"; // SVG logo component for branding
import { preloadRoute } from "@/routes/pages";

// ========================== COMPONENT: Navbar ========================== //
// Main application navigation bar (responsive)
// Handles desktop and mobile layouts, includes theme switch
export const Navbar = () => {
  const pathname = useLocation().pathname; // Track active route directly from router

  return (
    // HeroUI Navbar: sticky at the top, with max width
    <HeroUINavbar
      className="bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70"
      classNames={{ wrapper: "px-4 h-16" }}
      maxWidth="full"
      position="static"
    >
      {/* ================= BRAND / LOGO ================= */}
      <NavbarContent className="w-full items-center justify-between md:w-auto md:justify-start">
        <NavbarBrand className="flex items-center gap-2">
          {/* Logo link: clicking it navigates to home */}
          <Link
            className="flex items-center transition-colors duration-300 hover:text-danger dark:hover:text-danger"
            color="foreground"
            href="/"
            title="Home"
          >
            <Logo />
          </Link>
        </NavbarBrand>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeSwitch />
          <NavbarMenuToggle aria-label="Apri menu" />
        </div>
      </NavbarContent>

      {/* ================= MENU DESKTOP ================= */}
      <NavbarContent
        className="hidden md:flex justify-center flex-1"
        justify="center"
      >
        {/* Desktop menu visible from "md" breakpoint */}
        <ul className="hidden md:flex gap-4 justify-center ml-2">
          {siteConfig.navItems.map((item) => {
            const prefetch = () => preloadRoute(item.href);

            return (
              <NavbarItem key={item.href}>
                {/* Navigation link with active page highlight */}
                <Link
                  className={clsx(
                    linkStyles({
                      color: pathname === item.href ? "danger" : "foreground",
                    }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                  )}
                  color={pathname === item.href ? "danger" : "foreground"}
                  href={item.href}
                  onFocus={prefetch}
                  onMouseEnter={prefetch}
                  onTouchStart={prefetch}
                >
                  {item.label}
                </Link>
              </NavbarItem>
            );
          })}
        </ul>
      </NavbarContent>

      {/* ================= ACTIONS / THEME SWITCH (DESKTOP) ================= */}
      <NavbarContent className="hidden md:flex" justify="end">
        <NavbarItem className="hidden md:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      {/* ================= MOBILE MENU CONTENT ================= */}
      <NavbarMenu>
        <ul className="flex flex-col items-center justify-center min-h-[80vh] gap-4 p-6">
          {siteConfig.navMenuItems.map((item) => {
            const prefetch = () => preloadRoute(item.href);

            return (
              <NavbarMenuItem key={item.href}>
                {/* Each mobile menu item */}
                <Link
                  className="text-xl"
                  color={pathname === item.href ? "danger" : "foreground"}
                  href={item.href}
                  onFocus={prefetch}
                  onMouseEnter={prefetch}
                  onTouchStart={prefetch}
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            );
          })}
        </ul>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
