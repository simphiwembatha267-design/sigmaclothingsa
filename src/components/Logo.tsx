import sigmaMark from "@/assets/sigma-mark.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-8" }: LogoProps) {
  return (
    <img
      src={sigmaMark}
      alt="Sigma"
      className={`${className} w-auto object-contain select-none`}
      draggable={false}
    />
  );
}
