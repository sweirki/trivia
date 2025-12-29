const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Output folder
const outDir = path.join(__dirname, "app/assets/categories");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Gold gradient buffer (1024x1024)
const width = 1024;
const height = 1024;

// Linear gradient top → bottom (FBE7A1 → D8B24A)
function goldGradient() {
  return Buffer.from(
    `<svg width="${width}" height="${height}">
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FBE7A1"/>
        <stop offset="100%" stop-color="#D8B24A"/>
      </linearGradient>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`
  );
}

// Category letters
const icons = {
  geography: "G",
  science: "S",
  history: "H",
  movies: "M",
  music: "Mu",
  literature: "L",
  sports: "Sp",
  general: "GK",
  popculture: "P",
  logic: "Lo"
};

console.log("Generating GOLD placeholder icons...");

(async () => {
  for (const [name, letter] of Object.entries(icons)) {
    const file = path.join(outDir, `${name}.png`);

    // Create gold background
    const bg = await sharp(goldGradient())
      .resize(width, height)
      .png()
      .toBuffer();

    // Add centered black text
    const svgText = Buffer.from(
      `<svg width="${width}" height="${height}">
        <text
          x="50%"
          y="55%"
          font-size="280"
          font-family="Arial"
          font-weight="bold"
          fill="black"
          text-anchor="middle"
        >
          ${letter}
        </text>
      </svg>`
    );

    // Composite text onto background
    await sharp(bg)
      .composite([{ input: svgText, gravity: "center" }])
      .png()
      .toFile(file);

    console.log("✔ Created:", file);
  }

  console.log("\nALL ICONS CREATED SUCCESSFULLY!");
})();
