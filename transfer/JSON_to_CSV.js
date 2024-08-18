const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
const jsonFilePath = path.join(dataDir, 'BU_MET_FAQs.json');
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

const fields = ['module', 'question', 'answer'];
const opts = { fields };

function convertMarkdownToHtml(text) {
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function convertMarkdownFields(entry, fields) {
    fields.forEach(field => {
        if (entry[field]) {
            entry[field] = convertMarkdownToHtml(entry[field]);
        }
    });
}

// Apply conversion to relevant fields
jsonData.forEach(entry => {
    convertMarkdownFields(entry, ['answer']); // Add more fields as needed
});

const csvFilePath = path.join(dataDir, 'BU_MET_FAQs.csv');

// Check if the CSV file already exists and delete it if it does
if (fs.existsSync(csvFilePath)) {
    fs.unlinkSync(csvFilePath);
    console.log('Existing BU_MET_FAQs.csv file deleted.');
}

try {
    const parser = new Parser(opts);
    const csv = parser.parse(jsonData);

    fs.writeFileSync(csvFilePath, csv, 'utf8');
    console.log('CSV file successfully created:', csvFilePath);
} catch (err) {
    console.error('Error generating CSV file:', err);
}
