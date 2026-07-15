const fs = require('fs');
const path = require('path');

const dirsToDelete = [
  'apps/web/app/hadith',
  'apps/web/app/ai',
  'apps/api/src/hadith',
  'apps/api/src/ai',
  'packages/hadith',
];

const filesToDelete = [
  'IMPLEMENTATION_GUIDE.md',
  'PRODUCT_REDESIGN_MASTERPLAN.md'
];

dirsToDelete.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Deleted directory: ${dir}`);
  }
});

filesToDelete.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { force: true });
    console.log(`Deleted file: ${file}`);
  }
});
