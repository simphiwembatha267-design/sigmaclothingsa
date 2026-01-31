interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-12" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 120 140"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="S."
    >
      {/* Script S with loops */}
      <path
        d="M75 25
           C55 20, 35 30, 35 50
           C35 65, 50 70, 60 75
           C70 80, 55 85, 50 95
           C45 110, 55 125, 45 130
           C35 135, 25 125, 30 115
           C35 105, 50 100, 60 95
           C75 88, 85 75, 80 60
           C75 45, 55 50, 55 35
           C55 25, 70 20, 80 30
           C85 35, 80 45, 70 42
           C60 40, 58 30, 68 28
           C72 27, 75 28, 75 25"
        fill="none"
      />
      {/* Dot */}
      <circle cx="100" cy="115" r="8" fill="none" />
    </svg>
  );
}
