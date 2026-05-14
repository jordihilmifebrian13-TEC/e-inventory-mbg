import Image from "next/image";
import { cn } from "@/lib/utils";

type MbgLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function MbgLogo({ className, size = 40, priority }: MbgLogoProps) {
  return (
    <Image
      src="/logo-mbg.svg"
      alt="Logo Program Makan Bergizi Gratis"
      width={size}
      height={size}
      priority={priority}
      className={cn("h-auto w-auto shrink-0", className)}
      sizes={`${size}px`}
    />
  );
}
