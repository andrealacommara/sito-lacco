import DefaultLayout from "@/layouts/default";
import SpotifyPlayer from "@/components/spotifyPlayer";
import { subtitle, title } from "@/components/primitives";
import { Image } from "@heroui/image";
import totalPurpleLacco from "@/assets/images/totalPurpleLacco.jpg";
import { Card, Skeleton } from "@heroui/react";
import { useState } from "react";

export default function IndexPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <DefaultLayout>
      <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Scopri di più su Lacco</h1>
      </section>
      <Card className="flex flex-col md:flex-row items-center justify-center md:justify-center p-2 md:p-4 gap-2 md:gap-4">
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}
        <div className="p-4 md:p-4 w-fit md:w-full items-center">
          <Image
            isBlurred
            alt="Total Purple Lacco"
            className="item-center"
            src={totalPurpleLacco}
            width={500}
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        <div className="p-2 md:p-4">
          <h1 className={subtitle()}>
            Lacco unisce R&B e sonorità hip-hop in un viaggio introspettivo alla
            scoperta di sé. L'obiettivo è raccontare in musica quel che è solito
            rimanere nascosto, in assordante silezio, dentro ognuno di noi.
          </h1>
        </div>
      </Card>
      <section className="flex flex-row items-center justify-center py-4 md:py-4">
        <h2 className={subtitle()}>Ascolta subito i suoi brani</h2>
      </section>
      <SpotifyPlayer
        srcPlayer="https://open.spotify.com/embed/playlist/2OmODLkWLB3F6sPHYQe07g?utm_source=generator"
        size="large"
      />
    </DefaultLayout>
  );
}
