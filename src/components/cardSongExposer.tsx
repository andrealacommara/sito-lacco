// ========================== MAIN IMPORTS ========================== //
// Import core libraries and UI components for building the song card.
// Includes HeroUI components for layout, badges, buttons, modals, skeletons, and links,
// as well as React hooks for state management and media query detection.
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Skeleton } from "@heroui/skeleton";
import { useDisclosure } from "@heroui/use-disclosure";
import { useState } from "react"; // React hook for local state management
import { Link } from "@heroui/link"; // External link component
import { useMediaQuery } from "@react-hook/media-query"; // Hook to detect viewport size

import { SpotifyIcon } from "./icons"; // Custom Spotify icon component
import SmartImage from "./smartImage"; // Optimized image component with automatic loading

// ========================== INTERFACES ========================== //
// Props definition for CardSongExposer component
interface CardSongExposerProps {
  artworkAlt: string; // Alt text for the song artwork
  artworkSrc: string; // URL of the song artwork image
  songTitle: string; // Song title
  songDescription: string; // Short description of the song
  songSpotifyLink: string; // External link to the song on Spotify
  preSaveMode: boolean; // Flag indicating if "pre-save" mode is active
}

// ========================== COMPONENT: CardSongExposer ========================== //
// Displays a music track card with artwork, title, and description.
// Features an interactive hover preview and a detailed modal.
//
// - Supports "pre-save" mode with a "COMING SOON" badge.
// - Uses HeroUI components for responsive and consistent UI.
// - Includes an external link to the song on Spotify.
export default function CardSongExposer({
  artworkSrc,
  artworkAlt,
  songTitle,
  songDescription,
  songSpotifyLink,
  preSaveMode,
}: CardSongExposerProps) {
  const [isLoaded, setIsLoaded] = useState(false); // Tracks artwork image loading state
  const { isOpen, onOpen, onClose } = useDisclosure(); // Manages modal open/close state

  const handleOpen = () => {
    onOpen(); // Wrapper function to open modal
  };

  const isSmallScreen = useMediaQuery("(max-width: 400px)"); // Detects small screen sizes for badge scaling

  return (
    <div>
      {/* Main clickable card */}
      <Card
        isPressable
        className="group flex flex-col gap-4 pb-5 pt-5 px-5 bg-white transition-colors duration-300 hover:bg-danger w-full"
        radius="lg"
        shadow="md"
        onPress={() => handleOpen()}
      >
        {/* Skeleton placeholder displayed until artwork image loads */}
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}

        {/* Card content: artwork and optional badge */}
        <div>
          <Card className="border-none" radius="lg">
            <Badge
              disableAnimation
              classNames={{
                badge:
                  "translate-x-0 translate-y-0 font-semibold border-black!",
              }}
              color="success"
              content="COMING SOON"
              isInvisible={!preSaveMode} // Badge visible only in pre-save mode
              placement="top-right"
              size={isSmallScreen ? "sm" : "md"} // Adjust badge size based on screen
            >
              {/* Song artwork image */}
              <SmartImage
                alt={artworkAlt}
                className="rounded-lg"
                sizes="320px"
                src={artworkSrc}
                width={300}
                onLoad={() => setIsLoaded(true)} // Hide skeleton once image is loaded
              />
            </Badge>
          </Card>
        </div>

        {/* Song title */}
        <h1 className="text-center font-medium text-black transition-colors duration-300 group-hover:text-white truncate">
          {songTitle}
        </h1>
      </Card>

      {/* Modal displaying song details and Spotify link */}
      <Modal
        backdrop="blur"
        classNames={{
          wrapper:
            "flex items-center justify-center m-0! px-4 sm:px-6 w-full max-w-none",
        }}
        isOpen={isOpen}
        placement="center"
        onClose={onClose}
      >
        <ModalContent className="bg-white text-black dark:bg-white! dark:text-black! p-4 rounded-2xl shadow-xl max-w-[480px] mx-auto">
          {(onClose) => (
            <>
              {/* Modal header showing song title */}
              <ModalHeader className="items-center justify-center">
                <Card
                  className="bg-danger text-white dark:bg-danger dark:text-white items-center justify-center py-0.5 px-2"
                  radius="lg"
                >
                  {songTitle}
                </Card>
              </ModalHeader>

              {/* Modal body with song description */}
              <ModalBody>
                <p className="text-left font-medium whitespace-break-spaces">
                  {songDescription}
                </p>
              </ModalBody>

              {/* Modal footer with Spotify button */}
              <ModalFooter className="flex flex-col md:flex-row items-center justify-center">
                <Link
                  isExternal
                  aria-label="Vai al brano su Spotify" // Keep aria-label in Italian
                  href={songSpotifyLink}
                >
                  <Button color="success" onPress={onClose}>
                    {preSaveMode ? "Pre-Salva" : "Ascolta"} su Spotify
                    <SpotifyIcon />
                  </Button>
                </Link>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
