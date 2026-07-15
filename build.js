const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'www');

// Files and folders to copy to build directory
const assetsToCopy = [
  'index.html',
  'style.css',
  'app.js',
  'sw.js',
  'manifest.json',
  'data'
];

function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
}

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function build() {
  console.log('Cleaning build folder (www/)...');
  deleteFolderRecursive(destDir);
  
  console.log('Creating build folder (www/)...');
  fs.mkdirSync(destDir, { recursive: true });

  console.log('Assembling assets to www/...');
  for (const asset of assetsToCopy) {
    const srcPath = path.join(srcDir, asset);
    const destPath = path.join(destDir, asset);
    
    if (fs.existsSync(srcPath)) {
      console.log(`- Copying ${asset}`);
      copyRecursive(srcPath, destPath);
    } else {
      console.warn(`- Warning: Asset not found: ${asset}`);
    }
  }
  console.log('Build completed successfully! Assets are ready in www/ directory.');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
