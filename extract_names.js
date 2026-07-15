const fs = require('fs');

const banglaData = JSON.parse(fs.readFileSync('data/bn.bengali.json', 'utf8'));
const surahsData = JSON.parse(fs.readFileSync('data/surahs.json', 'utf8'));

surahsData.data.forEach((surah, i) => {
  surah.banglaName = banglaData.data.surahs[i].name; // check if this exists
});

fs.writeFileSync('data/surahs.json', JSON.stringify(surahsData));
console.log('Done mapping bangla names');
