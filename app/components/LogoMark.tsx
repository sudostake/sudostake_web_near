import Image from "next/image";

type LogoMarkProps = {
  size?: number;
  className?: string;
  ariaLabel?: string;
};

export function LogoMark({ size = 40, className, ariaLabel = "SudoStake logo mark" }: LogoMarkProps) {
  return (
    <Image
      src="/sudostake-logo-v2.svg"
      alt={ariaLabel}
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
