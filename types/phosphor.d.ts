declare module "@phosphor-icons/react" {
  import { ComponentType, SVGProps } from "react";
  type PhosphorIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; weight?: string; duotone?: boolean }>;
  export const Numpad: PhosphorIcon;
  export const Backspace: PhosphorIcon;
}
