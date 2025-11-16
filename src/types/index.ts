// ========================== MAIN IMPORTS ========================== //
// React SVG props extended by shared icon utilities.
import { SVGProps } from "react";

// ========================== ICON PROPS ========================== //
// Standard props used by every custom SVG icon in the project.
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
