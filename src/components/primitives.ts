// ========================== MAIN IMPORT ========================== //
// Tailwind Variants (tv) allows creating reusable and dynamic Tailwind classes
// based on variants, simplifying the management of complex styles.
import { tv } from "tailwind-variants";

// ========================== TITLE ========================== //
// Defines the main title style of the site (h1, headings, etc.)
// Uses variants for color, size, and width.
export const title = tv({
  // Base styles applied to all titles
  base: "tracking-tight inline font-semibold text-center",

  // Configurable variants to customize the title
  variants: {
    // Text color (gradients)
    color: {
      violet: "from-[#FF1CF7] to-[#b249f8]",
      yellow: "from-[#FF705B] to-[#FFB457]",
      blue: "from-[#5EA2EF] to-[#0072F5]",
      cyan: "from-[#00b7fa] to-[#01cfea]",
      green: "from-[#6FEE8D] to-[#17c964]",
      pink: "from-[#FF72E1] to-[#F54C7A]",
      foreground: "dark:from-[#FFFFFF] dark:to-[#4B4B4B]", // Neutral color for dark mode
    },

    // Title size
    size: {
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl",
      lg: "text-4xl lg:text-6xl",
    },

    // Option to make the title full width
    fullWidth: {
      true: "w-full block",
    },
  },

  // Default variant values
  defaultVariants: {
    size: "md",
  },

  // Compound variants — apply additional classes based on combinations
  compoundVariants: [
    {
      color: [
        "violet",
        "yellow",
        "blue",
        "cyan",
        "green",
        "pink",
        "foreground",
      ],
      // Apply gradient effect to the text
      class: "bg-clip-text text-transparent bg-linear-to-b",
    },
  ],
});

// ========================== SUBTITLE ========================== //
// Styles for subtitles or introductory paragraphs below main titles.
export const subtitle = tv({
  // Base styles for the subtitle
  base: "w-full md:w-1/2 my-2 text-lg lg:text-xl text-default-600 block max-w-full font-semibold text-center",

  // Configurable variants
  variants: {
    // Option to force full width
    fullWidth: {
      true: "w-full!",
    },

    // Optional text colors
    color: {
      danger: "text-danger", // Red
      success: "text-success", // Green
    },
  },

  // Default variant values
  defaultVariants: {
    fullWidth: true,
  },
});
