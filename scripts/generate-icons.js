const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const INPUT = path.join(__dirname, "..", "public", "logo.png");
const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  // icons 디렉토리 확인
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // 1) PWA 아이콘 생성
  for (const size of ICON_SIZES) {
    const output = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(INPUT).resize(size, size).png().toFile(output);
    console.log(`Created: icons/icon-${size}x${size}.png`);
  }

  // 2) favicon.ico (48x48 PNG → ICO 대용)
  await sharp(INPUT).resize(48, 48).png().toFile(path.join(PUBLIC_DIR, "favicon.png"));
  // Next.js는 favicon.ico 외에 favicon.png도 지원하지만, .ico로도 생성
  await sharp(INPUT)
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, "favicon-32x32.png"));
  await sharp(INPUT)
    .resize(16, 16)
    .png()
    .toFile(path.join(PUBLIC_DIR, "favicon-16x16.png"));
  // ICO 파일은 PNG 기반으로 생성 (브라우저가 PNG 포맷 ICO를 지원)
  const ico32 = await sharp(INPUT).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), ico32);
  console.log("Created: favicon.ico, favicon-32x32.png, favicon-16x16.png");

  // 3) OG 이미지 (1200x630, 로고를 중앙에 배치 + 배경)
  const logoSize = 300;
  const logoBuffer = await sharp(INPUT)
    .resize(logoSize, logoSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 255, g: 251, b: 235, alpha: 1 }, // warm-50 (#FFFBEB)
    },
  })
    .composite([
      {
        input: logoBuffer,
        left: Math.round((1200 - logoSize) / 2),
        top: Math.round((630 - logoSize) / 2) - 30,
      },
      {
        input: Buffer.from(
          `<svg width="1200" height="630">
            <text x="600" y="520" text-anchor="middle" font-size="48" font-weight="bold" fill="#92400E" font-family="Arial, sans-serif">감사일기</text>
            <text x="600" y="570" text-anchor="middle" font-size="24" fill="#D97706" font-family="Arial, sans-serif">매일 감사를 기록하는 습관</text>
          </svg>`
        ),
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toFile(path.join(PUBLIC_DIR, "og-image.png"));
  console.log("Created: og-image.png");

  // 4) Apple touch icon
  await sharp(INPUT)
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, "apple-touch-icon.png"));
  console.log("Created: apple-touch-icon.png");

  console.log("\nAll icons generated successfully!");
}

main().catch(console.error);
