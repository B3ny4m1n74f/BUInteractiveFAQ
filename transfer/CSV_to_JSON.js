const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const dataDir = path.join(__dirname, '../data');
const csvFilePath = path.join(dataDir, 'BU_MET_FAQs.csv');
const jsonFilePath = path.join(dataDir, 'BU_MET_FAQs.json');

// Check if the JSON file already exists and delete it if it does
if (fs.existsSync(jsonFilePath)) {
    fs.unlinkSync(jsonFilePath);
    console.log('Existing BU_MET_FAQs.json file deleted.');
}

const results = [];

try {
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data);
        })
        .on('end', () => {
            fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 4), 'utf8');
            console.log(`${results.length} records processed.`);
            console.log('JSON file successfully created:', jsonFilePath);
        });
} catch (error) {
    console.error('Error processing CSV file:', error);
}
