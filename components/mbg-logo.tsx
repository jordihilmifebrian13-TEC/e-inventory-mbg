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
      src="/logo-mbg.jpg"
      alt="Logo Badan Gizi Nasional"
      width={size}
      height={size}
      priority={priority}
      className={cn("h-auto w-auto shrink-0 rounded-full", className)}
      sizes={`${size}px`}
    />
  );
}