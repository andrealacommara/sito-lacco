import {
  Badge,
  Button,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  useDisclosure,
} from "@heroui/react";
import { Image } from "@heroui/image";
import { useState } from "react";
import { Link } from "@heroui/link";

import { SpotifyIcon } from "./icons";

interface CardSongExposerProps {
  artworkAlt: string;
  artworkSrc: string;
  songTitle: string;
  songDescription: string;
  songSpotifyLink: string;
  preSaveMode: boolean;
}

/**
 * Componente CardSongExposer
 *
 * Mostra la card di un brano musicale con immagine, titolo e descrizione.
 * Include un'anteprima interattiva con effetto hover e un modal di dettaglio.
 *
 * - Supporta la modalità "pre-save" con badge "COMING SOON".
 * - Usa HeroUI per UI responsive e coerente.
 * - Integra un link esterno a Spotify.
 */
export default function CardSongExposer({
  artworkSrc,
  artworkAlt,
  songTitle,
  songDescription,
  songSpotifyLink,
  preSaveMode,
}: CardSongExposerProps) {
  // Gestisce lo stato di caricamento dell'immagine
  const [isLoaded, setIsLoaded] = useState(false);

  // Hook HeroUI per aprire e chiudere il modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Funzione wrapper per apertura modale
  const handleOpen = () => {
    onOpen();
  };

  return (
    <div>
      {/* Card principale cliccabile */}
      <Card
        isPressable
        className="group p-6 bg-white transition-colors duration-300 hover:bg-danger"
        radius="lg"
        shadow="md"
        onPress={() => handleOpen()}
      >
        {/* Placeholder visivo durante il caricamento */}
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}

        {/* Contenuto della card con immagine e badge opzionale */}
        <div>
          <Card className="border-none" radius="lg">
            <Badge
              disableAnimation
              classNames={{
                badge:
                  "translate-x-0 translate-y-0 font-semibold border-black! max-w-full",
              }}
              color="success"
              content="COMING SOON"
              isInvisible={!preSaveMode}
              placement="top-right"
            >
              {/* Immagine del brano */}
              <Image
                alt={artworkAlt}
                className="rounded-lg"
                src={artworkSrc}
                width={280}
                loading="eager"
                onLoad={() => setIsLoaded(true)}
              />
            </Badge>
          </Card>
        </div>

        {/* Titolo del brano */}
        <h1 className="text-center mt-4 font-medium text-black transition-colors duration-300 group-hover:text-white">
          {songTitle}
        </h1>
      </Card>

      {/* Modal con dettagli e link a Spotify */}
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
              {/* Header del modal con titolo del brano */}
              <ModalHeader className="items-center justify-center">
                <Card
                  className="bg-danger text-white dark:bg-danger dark:text-white items-center justify-center py-0.5 px-2"
                  radius="lg"
                >
                  {songTitle}
                </Card>
              </ModalHeader>

              {/* Corpo del modal con descrizione */}
              <ModalBody>
                <p className="text-left font-medium whitespace-break-spaces">
                  {songDescription}
                </p>
              </ModalBody>

              {/* Footer con pulsante per ascoltare o pre-salvare su Spotify */}
              <ModalFooter className="flex flex-col md:flex-row items-center justify-center">
                <Link isExternal href={songSpotifyLink} aria-label="Vai al brano su Spotify">
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
