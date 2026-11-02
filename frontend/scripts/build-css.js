const fs = require("fs");
const path = require("path");
const s = require("@tailwindcss/node");
const A = require("@tailwindcss/oxide");

async function buildCss() {
  const rootDir = path.resolve(__dirname, "..");
  const cssPath = path.resolve(rootDir, "src/app/globals.css");
  const outputPath = path.resolve(rootDir, "src/app/tailwind-built.css");

  // Read globals.css but strip any import of tailwind-built.css if present to avoid recursion
  let rawCss = fs.readFileSync(cssPath, "utf8");
  rawCss = rawCss.replace('@import "./tailwind-built.css";', '').trim();

  // If rawCss doesn't start with @import "tailwindcss";, ensure it's there for compilation
  if (!rawCss.includes('@import "tailwindcss";')) {
    rawCss = '@import "tailwindcss";\n' + rawCss;
  }

  const compiler = await s.compile(rawCss, {
    from: cssPath,
    base: path.dirname(cssPath),
    onDependency: () => {},
    shouldRewriteUrls: true
  });

  const scanner = new A.Scanner({
    sources: [
      { base: path.resolve(rootDir, "src"), pattern: "**/*.{ts,tsx,js,jsx}", negated: false }
    ]
  });

  const candidates = scanner.scan();
  const builtCss = compiler.build(candidates);

  fs.writeFileSync(outputPath, builtCss, "utf8");
  console.log(`✅ [Tailwind Builder] Generated ${builtCss.length} bytes of compiled CSS to ${outputPath}`);
}

buildCss().catch((err) => {
  console.error("❌ Failed to build Tailwind CSS:", err);
  process.exit(1);
});
