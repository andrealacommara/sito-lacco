import { Card } from "@heroui/react";
import { Image } from "@heroui/image";

interface CardSongExposerProps {
  artworkAlt: string;
  artworkSrc: string;
  artworkTitle: string;
  artworkDescription: string;
}

export default function CardSongExposer({
  artworkSrc,
  artworkAlt,
  artworkTitle,
  // artworkDescription, da integrare in seguito nella modale
}: CardSongExposerProps) {
  return (
    <Card
      className="group p-6 bg-white transition-colors duration-300 hover:bg-danger"
      radius="lg"
      shadow="md"
      isPressable
      onPress={() => console.log("pressed")}
    >
      <Card className="border-none" radius="lg">
        <Image
          alt={artworkAlt}
          className="rounded-lg"
          src={artworkSrc}
          width={280}
        />
      </Card>
      <h1 className="text-center mt-4 font-medium text-black transition-colors duration-300 group-hover:text-white">
        {artworkTitle}
      </h1>
    </Card>
  );
}
