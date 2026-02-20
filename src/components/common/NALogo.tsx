interface NALogoProps {
  size?: number;
  className?: string;
}

export default function NALogo({ size = 48, className = "" }: NALogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 외부 원 */}
      <circle cx="100" cy="100" r="96" fill="#1a3a6b" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="#FFD700" strokeWidth="4" />

      {/* 다이아몬드 */}
      <polygon
        points="100,18 182,100 100,182 18,100"
        fill="#FFD700"
      />

      {/* 다이아몬드 안쪽 배경 */}
      <polygon
        points="100,30 170,100 100,170 30,100"
        fill="#1a3a6b"
      />

      {/* N */}
      <text
        x="58"
        y="118"
        fontSize="72"
        fontWeight="bold"
        fill="#FFD700"
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
      >
        N
      </text>

      {/* A */}
      <text
        x="142"
        y="118"
        fontSize="72"
        fontWeight="bold"
        fill="#FFD700"
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
      >
        A
      </text>
    </svg>
  );
}
