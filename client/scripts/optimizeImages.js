const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/optimized');

// Create directories if they don't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir, { recursive: true });
}

// Optimize images
const optimizeImages = async () => {
  const files = fs.readdirSync(inputDir);
  
  if (files.length === 0) {
    console.log('No images found in input directory. Please add images to public/images/');
    return;
  }

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      try {
        await sharp(path.join(inputDir, file))
          .webp({ quality: 80 })
          .toFile(path.join(outputDir, `${path.parse(file).name}.webp`));
        console.log(`✓ Optimized: ${file}`);
      } catch (err) {
        console.error(`✗ Error optimizing ${file}:`, err);
      }
    }
  }
};

optimizeImages(); 