// ========================== MAIN IMPORTS ========================== //
// Import core libraries and components for animations, image handling, state management, and layout.
import { motion } from "framer-motion"; // Provides scroll-based entrance animations
import { Image } from "@heroui/image"; // Image component with automatic loading management
import { useEffect, useRef, useState } from "react"; // React hooks for state, effects, and DOM references
import { Card, Skeleton } from "@heroui/react"; // UI components for layout and loading placeholders
import { subtitle } from "./primitives"; // Predefined styling function for subtitles

// ========================== CUSTOM HOOK: useInView ========================== //
// Detects if a DOM element is currently visible in the viewport (scroll reveal).
// Uses IntersectionObserver to trigger animations only when the element enters the screen.
function useInView(
  ref: React.RefObject<HTMLDivElement | null>,
  threshold = 0.2
) {
  const [isInView, setIsInView] = useState(false); // Tracks visibility state

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting), // Update visibility state when intersection changes
      { threshold } // Visibility threshold to consider the element "in view"
    );

    if (ref.current) observer.observe(ref.current); // Start observing the element

    return () => {
      if (ref.current) observer.unobserve(ref.current); // Cleanup observer on unmount
    };
  }, [ref, threshold]);

  return isInView; // Returns true if the element is currently in view
}

// ========================== COMPONENT: AboutSection ========================== //
// Represents a single "About Me" section with animated text and image.
// Props:
// - text: string content of the section
// - image: URL of the image to display
// - reversed: optional boolean to invert the layout (image/text order)
export function AboutSection({
  text,
  image,
  reversed = false,
}: {
  text: string;
  image: string;
  reversed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null); // DOM reference for viewport detection
  const inView = useInView(ref); // Boolean indicating if the section is visible
  const [isLoaded, setIsLoaded] = useState(false); // Tracks image loading state

  return (
    // motion.div enables animation when the section appears on screen
    <div className="overflow-x-hidden">
      <motion.div
        ref={ref}
        animate={inView ? { opacity: 1, x: 0 } : {}} // Animate only when visible
        initial={{ opacity: 0, x: reversed ? 100 : -100 }} // Initial entrance direction based on layout
        transition={{ duration: 0.8, ease: "easeOut" }} // Animation duration and easing
      >
        {/* Card containing text and image arranged in rows or columns */}
        <Card
          className={`flex flex-col-reverse md:flex-row ${
            reversed ? "md:flex-row-reverse" : ""
          } items-center md:items-center justify-center md:justify-center p-2 md:p-4 gap-2 md:gap-4 mx-auto  w-full max-w-5xl`}
        >
          {/* Skeleton placeholder displayed until the image finishes loading */}
          {!isLoaded && (
            <Skeleton className="absolute inset-0 rounded-lg">
              <div className="h-full w-full bg-default-300 rounded-lg" />
            </Skeleton>
          )}

          {/* Section descriptive text */}
          <div className="p-2 md:p-4">
            <h1 className={subtitle()}>{text}</h1>
          </div>

          {/* Section image with controlled loading and styling */}
          <div className="p-4 md:p-4 w-fit md:w-full items-center">
            <Image
              alt="Lacco"
              className="item-center"
              src={image}
              width={400}
              loading="eager"
              onLoad={() => setIsLoaded(true)} // Hide skeleton once the image has loaded
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
