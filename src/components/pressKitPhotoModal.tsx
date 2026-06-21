// ========================== MAIN IMPORTS ========================== //
import type { ImageLikeImport } from "@/components/smartImage";

import { useState } from "react";
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

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={18}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={18}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// ========================== INTERFACE ========================== //
interface PressKitPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: ImageLikeImport;
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
  const modal = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  const [loaded, setLoaded] = useState(false);

  return (
    <Modal state={modal}>
      <ModalBackdrop isDismissable variant="blur">
        <ModalContainer
          className="flex items-center justify-center px-4 w-full max-w-none"
          placement="center"
          size="lg"
        >
          <ModalDialog className="relative rounded-2xl">
            <button
              aria-label="Chiudi"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-default-500 transition-colors hover:bg-default-100"
              type="button"
              onClick={onClose}
            >
              <CloseIcon />
            </button>

            <ModalHeader className="flex justify-center">
              <ModalHeading className="text-center text-lg font-semibold font-display">
                {alt}
              </ModalHeading>
            </ModalHeader>

            <ModalBody className="overflow-hidden">
              <div className="relative flex items-center justify-center">
                {!loaded && (
                  <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-default-300 border-t-danger" />
                )}
                <SmartImage
                  alt={alt}
                  className="rounded-lg"
                  isBlurred={false}
                  sizes="600px"
                  src={src}
                  style={{
                    maxHeight: "62vh",
                    maxWidth: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 0.25s ease",
                  }}
                  onLoad={() => setLoaded(true)}
                />
              </div>
            </ModalBody>

            <ModalFooter className="flex justify-center">
              <a download href={downloadUrl}>
                <Button className="rounded-xl" variant="danger">
                  Scarica in alta qualità
                </Button>
              </a>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}
