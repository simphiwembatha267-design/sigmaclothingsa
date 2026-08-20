import sigmaMark from "@/assets/sigma-mark.png.asset.json";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-8" }: LogoProps) {
  return (
    <img
      src={sigmaMark.url}
      alt="Sigma"
      className={`${className} w-auto object-contain select-none`}
      draggable={false}
    />
  );
}
