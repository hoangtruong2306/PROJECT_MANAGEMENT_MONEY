const fs = require('fs');
const path = require('path');

const resDir = 'd:/PROJECT_MANGEMENT/expense-mobile/app/src/main/res';
const mipmapDir = path.join(resDir, 'mipmap-anydpi-v26');
const drawableDir = path.join(resDir, 'drawable');

if (!fs.existsSync(mipmapDir)) fs.mkdirSync(mipmapDir, { recursive: true });
if (!fs.existsSync(drawableDir)) fs.mkdirSync(drawableDir, { recursive: true });

// 1. ic_launcher_background.xml
fs.writeFileSync(path.join(drawableDir, 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#7C3AED"
        android:pathData="M0,0h108v108h-108z" />
</vector>`);

// 2. ic_launcher_foreground.xml (Simple 'E' logo)
fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.xml'), `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="216dp"
    android:height="216dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M30,30h48v8h-40v12h30v8h-30v12h40v8h-48z" />
</vector>`);

// 3. ic_launcher.xml
const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`;

fs.writeFileSync(path.join(mipmapDir, 'ic_launcher.xml'), adaptiveIcon);
fs.writeFileSync(path.join(mipmapDir, 'ic_launcher_round.xml'), adaptiveIcon);

console.log('Successfully generated missing icon resources!');
