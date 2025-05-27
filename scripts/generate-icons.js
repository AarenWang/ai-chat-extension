const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const inputFile = path.join(__dirname, '../src/icons/icon.svg');
const outputDir = path.join(__dirname, '../src/icons');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 生成不同尺寸的图标
async function generateIcons() {
    for (const size of sizes) {
        const outputFile = path.join(outputDir, `icon${size}.png`);
        await sharp(inputFile)
            .resize(size, size)
            .png()
            .toFile(outputFile);
        console.log(`Generated ${outputFile}`);
    }
}

generateIcons().catch(console.error); 