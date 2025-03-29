import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);

const SOURCE_ICON = 'attached_assets/LOGOGORF.png';
const TEMP_ICON = 'temp_icon.png';

// Configurações para iOS
const IOS_ICON_SIZES = [
  { name: 'Icon-App-20x20@1x.png', size: 20 },
  { name: 'Icon-App-20x20@2x.png', size: 40 },
  { name: 'Icon-App-20x20@3x.png', size: 60 },
  { name: 'Icon-App-29x29@1x.png', size: 29 },
  { name: 'Icon-App-29x29@2x.png', size: 58 },
  { name: 'Icon-App-29x29@3x.png', size: 87 },
  { name: 'Icon-App-40x40@1x.png', size: 40 },
  { name: 'Icon-App-40x40@2x.png', size: 80 },
  { name: 'Icon-App-40x40@3x.png', size: 120 },
  { name: 'Icon-App-60x60@2x.png', size: 120 },
  { name: 'Icon-App-60x60@3x.png', size: 180 },
  { name: 'Icon-App-76x76@1x.png', size: 76 },
  { name: 'Icon-App-76x76@2x.png', size: 152 },
  { name: 'Icon-App-83.5x83.5@2x.png', size: 167 },
  { name: 'AppStoreIcon.png', size: 1024 },
];

// Configurações para Android
const ANDROID_ICON_SIZES = [
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png', size: 48 },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png', size: 72 },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png', size: 96 },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', size: 144 },
  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', size: 192 },
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', size: 48 },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png', size: 72 },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png', size: 96 },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png', size: 144 },
  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', size: 192 }
];

async function resizeImage(input, output, size) {
  try {
    await execAsync(`convert "${input}" -resize ${size}x${size} "${output}"`);
    console.log(`✅ Created: ${output} (${size}x${size})`);
  } catch (error) {
    if (error.message.includes('command not found')) {
      console.error('❌ Error: ImageMagick is not installed. Please install ImageMagick first.');
      process.exit(1);
    }
    console.error(`❌ Error creating ${output}: ${error.message}`);
  }
}

async function createIosIcons() {
  console.log('🔄 Creating iOS icons...');
  
  // Ensure directory exists
  fs.mkdirSync('ios-assets/AppIcon', { recursive: true });
  
  // Create icons for each size
  for (const icon of IOS_ICON_SIZES) {
    await resizeImage(SOURCE_ICON, `ios-assets/AppIcon/${icon.name}`, icon.size);
  }
  
  console.log('✅ All iOS icons created successfully!');
}

async function createAndroidIcons() {
  console.log('🔄 Creating Android icons...');
  
  for (const icon of ANDROID_ICON_SIZES) {
    // Create rounded version for round icons
    if (icon.path.includes('_round')) {
      await execAsync(`convert "${SOURCE_ICON}" -resize ${icon.size}x${icon.size} \
        \\( +clone -alpha extract -draw "fill black circle ${icon.size/2},${icon.size/2} ${icon.size/2},0" \
        -blur 0x1 \\) -alpha off -compose CopyOpacity -composite "${icon.path}"`);
    } else {
      await resizeImage(SOURCE_ICON, icon.path, icon.size);
    }
  }
  
  console.log('✅ All Android icons created successfully!');
}

async function main() {
  console.log('🚀 Starting icon generation process...');
  
  try {
    await createIosIcons();
    await createAndroidIcons();
    
    console.log('\n✅ All icons generated successfully!');
    console.log('📱 iOS icons are in: ios-assets/AppIcon/');
    console.log('📱 Android icons are in their respective mipmap directories');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the ios-assets/AppIcon folder to your Xcode project');
    console.log('2. Android icons are already in place');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

main();