/**
 * Generates icon.png (512), apple-touch-icon.png (180), og-image.png (1200x630)
 * from public/alpha-logo.png. Run: node scripts/generate-brand-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");

const navy = "#0a0f1e";

async function main() {
  const logoPath = path.join(pub, "alpha-logo.png");
  const logoBuf = await fs.readFile(logoPath);

  const logo512 = await sharp(logoBuf)
    .resize(512, 512, { fit: "contain", background: navy })
    .png()
    .toBuffer();

  await fs.writeFile(path.join(pub, "icon.png"), logo512);

  await sharp(logoBuf)
    .resize(180, 180, { fit: "contain", background: navy })
    .png()
    .toFile(path.join(pub, "apple-touch-icon.png"));

  const branded = `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${navy}"/>
    <text x="600" y="520" fill="#38a3ff" font-family="system-ui,sans-serif"
      font-size="28" font-weight="600" text-anchor="middle">
      Alpha Solutions — Web · Digital · Freight
    </text>
  </svg>`;

  const logoOg = await sharp(logoBuf)
    .resize(420, 420, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(Buffer.from(branded))
    .composite([
      {
        input: logoOg,
        top: Math.round((630 - 420) / 2) - 24,
        left: Math.round((1200 - 420) / 2),
      },
    ])
    .png()
    .toFile(path.join(pub, "og-image.png"));

  console.log("Wrote public/icon.png, apple-touch-icon.png, og-image.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
