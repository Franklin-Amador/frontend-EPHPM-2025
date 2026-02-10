const { readFileSync } = require('fs');

const geojson = JSON.parse(readFileSync('public/gadm41_HND_1.json', 'utf-8'));
const geoNames = geojson.features.map(f => f.properties.NAME_1);
console.log("GeoJSON NAME_1 values:");
geoNames.forEach(n => console.log(`  "${n}"`));

const csv = readFileSync('user_read_only_context/text_attachments/df_depto-PX5bQ.csv', 'utf-8');
const csvNames = csv.trim().split('\n').slice(1).map(line => line.split(',')[0]);
console.log("\nCSV DEPTO values:");
csvNames.forEach(n => console.log(`  "${n}"`));

console.log("\n--- Matching ---");
for (const gn of geoNames) {
  const match = csvNames.find(cn => cn === gn);
  if (match) {
    console.log(`OK: "${gn}" => "${match}"`);
  } else {
    console.log(`MISS: "${gn}" => no exact match`);
  }
}
