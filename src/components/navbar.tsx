import { Link } from "@heroui/link";
import { useLocation } from "react-router-dom";

import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TikTokIcon,
  SpotifyIcon,
  InstagramIcon,
} from "@/components/icons";
import { Logo } from "@/components/icons";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const location = useLocation();
  const [pathname, setPathname] = useState(location.pathname);

  useEffect(() => {
    setPathname(location.pathname);
    console.log(location.pathname);
  }, [location]);

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent justify="start" className="basis-1/5 sm:basis-full">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="basis-1/5 sm:basis-full" justify="center">
        <div className="hidden md:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({
                    color: pathname === item.href ? "danger" : "foreground",
                  }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color={pathname === item.href ? "danger" : "foreground"}
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden md:flex basis-1/5 md:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden md:flex gap-2">
                    <Link isExternal href={siteConfig.links.spotify} title="Spotify">
            <SpotifyIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.tiktok} title="TikTok">
            <TikTokIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.instagram} title="Instagram">
            <InstagramIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="md:hidden  gap-2" justify="end">
        <Link isExternal href={siteConfig.links.spotify}>
          <SpotifyIcon className="text-default-500" />
        </Link>
                  <Link isExternal href={siteConfig.links.tiktok} title="TikTok">
            <TikTokIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.instagram} title="Instagram">
            <InstagramIcon className="text-default-500" />
          </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2 items-center justify-center">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={pathname === item.href ? "danger" : "foreground"}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
