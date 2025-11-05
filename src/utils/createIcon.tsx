import { IconSvgProps } from "@/types";

export const createIcon = (path: string, viewBox = "0 0 512 512") => {
  return ({ size = 29, width, height, ...props }: IconSvgProps) => (
    <svg
      height={size || height}
      width={size || width}
      viewBox={viewBox}
      {...props}
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
};
