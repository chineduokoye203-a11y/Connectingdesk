import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check root directory first, fallback to tokens directory
const findFilePath = (filename) => {
  const rootPath = path.join(__dirname, filename);
  const tokensSubPath = path.join(__dirname, 'tokens', filename);
  if (fs.existsSync(rootPath)) return rootPath;
  if (fs.existsSync(tokensSubPath)) return tokensSubPath;
  return rootPath;
};

const colorTokensPath = findFilePath('color-tokens.json');
const typographyTokensPath = findFilePath('design-tokens.tokens.json');
const outputCssPath = path.join(__dirname, 'variables.css');

function slugify(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-');
}

function processTokens() {
  const colorData = JSON.parse(fs.readFileSync(colorTokensPath, 'utf8'));
  const typographyData = JSON.parse(fs.readFileSync(typographyTokensPath, 'utf8'));

  let cssContent = `/* Auto-generated CSS Variables from Design & Color Tokens */\n\n`;

  // 1. Process Color Tokens (Only Color Roles used by UI)
  if (colorData.color) {
    if (colorData.color.light) {
      cssContent += `:root {\n`;
      cssContent += `  /* Light Theme Color Roles */\n`;
      for (const [key, value] of Object.entries(colorData.color.light)) {
        cssContent += `  --color-${slugify(key)}: ${value};\n`;
      }
      cssContent += `}\n\n`;
    }

    if (colorData.color.dark) {
      cssContent += `[data-theme="dark"] {\n`;
      cssContent += `  /* Dark Theme Color Roles */\n`;
      for (const [key, value] of Object.entries(colorData.color.dark)) {
        cssContent += `  --color-${slugify(key)}: ${value};\n`;
      }
      cssContent += `}\n\n`;
    }
  }

  // 2. Process Other Non-Color Tokens (spacing, borderRadius, shadows, elevation)
  cssContent += `:root {\n`;

  if (colorData.spacing) {
    cssContent += `  /* Spacing */\n`;
    for (const [key, value] of Object.entries(colorData.spacing)) {
      cssContent += `  --${slugify(key)}: ${value};\n`;
    }
    cssContent += `\n`;
  }

  if (colorData.borderRadius) {
    cssContent += `  /* Border Radius */\n`;
    for (const [key, value] of Object.entries(colorData.borderRadius)) {
      if (value !== undefined) {
        cssContent += `  --${slugify(key)}: ${value};\n`;
      }
    }
    cssContent += `\n`;
  }

  if (colorData.shadows) {
    cssContent += `  /* Shadows */\n`;
    for (const [key, value] of Object.entries(colorData.shadows)) {
      cssContent += `  --${slugify(key)}: ${value};\n`;
    }
    cssContent += `\n`;
  }

  if (colorData.elevation) {
    cssContent += `  /* Elevation */\n`;
    for (const [key, value] of Object.entries(colorData.elevation)) {
      cssContent += `  --${slugify(key)}: ${value};\n`;
    }
    cssContent += `\n`;
  }

  // 3. Process Typography Tokens
  if (typographyData.font) {
    cssContent += `  /* Typography Styles */\n`;
    for (const [fontName, fontGroup] of Object.entries(typographyData.font)) {
      const slugName = slugify(fontName);

      let styleObj = null;
      if (fontGroup.type === 'custom-fontStyle' && fontGroup.value) {
        styleObj = fontGroup.value;
      } else if (fontGroup.fontSize) {
        styleObj = {};
        for (const [propName, propObj] of Object.entries(fontGroup)) {
          if (propObj && typeof propObj === 'object' && 'value' in propObj) {
            styleObj[propName] = propObj.value;
          }
        }
      }

      if (styleObj) {
        if (styleObj.fontFamily) cssContent += `  --font-${slugName}-family: ${styleObj.fontFamily}, sans-serif;\n`;
        if (styleObj.fontSize) cssContent += `  --font-${slugName}-size: ${styleObj.fontSize}px;\n`;
        if (styleObj.fontWeight) cssContent += `  --font-${slugName}-weight: ${styleObj.fontWeight};\n`;
        if (styleObj.lineHeight) cssContent += `  --font-${slugName}-line-height: ${styleObj.lineHeight}px;\n`;
        if (styleObj.letterSpacing !== undefined) cssContent += `  --font-${slugName}-letter-spacing: ${styleObj.letterSpacing}px;\n`;
        if (styleObj.fontStyle) cssContent += `  --font-${slugName}-style: ${styleObj.fontStyle};\n`;
      }
    }
  }

  cssContent += `}\n`;

  fs.writeFileSync(outputCssPath, cssContent, 'utf8');
  console.log(`Successfully generated CSS variables at: ${outputCssPath}`);
}

processTokens();
