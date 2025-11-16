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
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="xl"
      placement="center"
      backdrop="blur"
      classNames={{
          wrapper:
            "flex items-center justify-center px-4 w-full max-w-none",
        }}
    >
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">{alt}</ModalHeader>

        <ModalBody>
          <SmartImage
            src={src}
            alt={alt}
            className="rounded-lg"
            sizes="600px"
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
            isBlurred={false}
          />
        </ModalBody>

        <ModalFooter className="flex justify-center">
          <a href={downloadUrl} download>
            <Button color="danger">Scarica in alta qualità</Button>
          </a>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
