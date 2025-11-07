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
import { SpotifyIcon } from "./icons";
import { Link } from "@heroui/link";

interface CardSongExposerProps {
  artworkAlt: string;
  artworkSrc: string;
  songTitle: string;
  songDescription: string;
  songSpotifyLink: string;
  preSaveMode: boolean;
}

export default function CardSongExposer({
  artworkSrc,
  artworkAlt,
  songTitle,
  songDescription,
  songSpotifyLink,
  preSaveMode,
}: CardSongExposerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleOpen = () => {
    onOpen();
  };

  return (
    <div>
      <Card
        className="group p-6 bg-white transition-colors duration-300 hover:bg-danger"
        radius="lg"
        shadow="md"
        isPressable
        onPress={() => handleOpen()}
      >
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}
        <div>
          <Card className="border-none" radius="lg">
            <Badge
              content="PROSSIMAMENTE"
              color="success"
              placement="bottom-right"
              disableAnimation
              isInvisible={!preSaveMode}
              classNames={{
                badge:
                  "translate-x-1 translate-y-1 text-sm font-semibold !border-none",
              }}
            >
              <Image
                alt={artworkAlt}
                className="rounded-lg"
                src={artworkSrc}
                width={280}
                onLoad={() => setIsLoaded(true)}
              />
            </Badge>
          </Card>
        </div>
        <h1 className="text-center mt-4 font-medium text-black transition-colors duration-300 group-hover:text-white">
          {songTitle}
        </h1>
      </Card>
      <Modal backdrop="blur" placement="center" isOpen={isOpen} onClose={onClose}>
        <ModalContent className="bg-white text-black dark:!bg-white dark:!text-black p-2">
          {(onClose) => (
            <>
              <ModalHeader className="items-center justify-center">
                <Card
                  radius="lg"
                  className="bg-danger text-white dark:bg-danger dark:text-white items-center justify-center py-0.5 px-2"
                >
                  {songTitle}
                </Card>
              </ModalHeader>
              <ModalBody>
                <div>
                  <p className="text-center font-medium ">{songDescription}</p>
                </div>
              </ModalBody>
              <ModalFooter className="flex flex-col md:flex-row items-center justify-center">
                <Link isExternal href={songSpotifyLink}>
                  <Button color="success" onPress={onClose}>
                    {preSaveMode? "Pre-Salva" : "Ascolta"} su Spotify
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
