// ========================== MAIN IMPORTS ========================== //
import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalBody,
  ModalHeader,
  ModalHeading,
  ModalFooter,
  Button,
  useOverlayState,
} from "@heroui/react";

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
  // Controlled overlay state: mirrors the parent's `isOpen` and reports closing
  // back through `onClose`, preserving the v2 prop-driven open/close behaviour.
  const modal = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  return (
    <Modal state={modal}>
      <ModalBackdrop isDismissable variant="blur">
        <ModalContainer
          className="flex items-center justify-center px-4 w-full max-w-none"
          placement="center"
          scroll="inside"
          size="lg"
        >
          <ModalDialog>
            <ModalHeader>
              <ModalHeading className="text-lg font-semibold">
                {alt}
              </ModalHeading>
            </ModalHeader>

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
                <Button variant="danger">Scarica in alta qualità</Button>
              </a>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}
