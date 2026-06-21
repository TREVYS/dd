import Image from "next/image";

export function LogoIcon({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo-icon.svg"
      alt="TREVYS"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

export function LogoFull({ height = 32, className = "" }: { height?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo-full.svg"
      alt="TREVYS"
      width={height * 3.8}
      height={height}
      className={className}
      priority
    />
  );
}
