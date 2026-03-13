// ========================== MAIN IMPORTS ========================== //
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

import SmartImage from "@/components/smartImage";

// ========================== INTERFACE ========================== //
interface PressKitPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  downloadUrl: string;
}

// ===================== PRESS KIT PHOTO MODAL ===================== //
export default function PressKitPhotoModal({
  isOpen,
  onClose,
  src,
  alt,
  downloadUrl,
}: PressKitPhotoModalProps) {
  return (
    <Modal
      backdrop="blur"
      classNames={{
        wrapper: "flex items-center justify-center px-4 w-full max-w-none",
      }}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">{alt}</ModalHeader>

        <ModalBody>
          <SmartImage
            alt={alt}
            className="rounded-lg"
            isBlurred={false}
            sizes="600px"
            src={src}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </ModalBody>

        <ModalFooter className="flex justify-center">
          <a download href={downloadUrl}>
            <Button color="danger">Scarica in alta qualità</Button>
          </a>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
