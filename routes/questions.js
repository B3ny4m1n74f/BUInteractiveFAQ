const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const archiver = require('archiver');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });
const jsonFilePath = path.join(__dirname, '../data/BU_MET_FAQs.json');
const csvToJsonScriptPath = path.join(__dirname, '../transfer/CSV_to_JSON.js');
const jsonToCsvScriptPath = path.join(__dirname, '../transfer/JSON_to_CSV.js');

// Helper function to handle file read/write errors
const handleFileError = (err, res, message) => {
    console.error(message, err);
    res.status(500).send({ error: message });
};

// Helper function to run a script
const runScript = (scriptPath, res, successMessage, errorMessage) => {
    exec(`node ${scriptPath}`, (err, stdout, stderr) => {
        if (err) {
            console.error(errorMessage, err);
            console.error(stderr);
            res.status(500).send({ error: errorMessage });
        } else {
            console.log(stdout);
            res.send({ success: true, message: successMessage });
        }
    });
};

// Read JSON data
router.get('/', (req, res) => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) return handleFileError(err, res, 'Failed to read questions data');
        res.send(JSON.parse(data));
    });
});

// Return answer to a question
router.post('/ask', (req, res) => {
    const userQuestion = req.body.question.toLowerCase();

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) return handleFileError(err, res, 'Failed to read questions data');

        const questions = JSON.parse(data);
        const answer = questions.find(q => q.question.toLowerCase() === userQuestion)?.answer;

        if (answer) {
            res.send({ answer });
        } else {
            res.status(404).send({ error: 'Question not found' });
        }
    });
});

// Add new FAQ
router.post('/', (req, res) => {
    const newFAQ = req.body;

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) return handleFileError(err, res, 'Failed to read questions data');

        const questions = JSON.parse(data);
        questions.push(newFAQ);

        fs.writeFile(jsonFilePath, JSON.stringify(questions, null, 2), (err) => {
            if (err) return handleFileError(err, res, 'Failed to save the new FAQ');
            runScript(jsonToCsvScriptPath, res, 'New FAQ added and CSV updated successfully.', 'Failed to convert JSON to CSV');
        });
    });
});

// Update FAQ by index
router.put('/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    const updatedFAQ = req.body;

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) return handleFileError(err, res, 'Failed to read questions data');

        const questions = JSON.parse(data);

        if (index >= 0 && index < questions.length) {
            questions[index] = updatedFAQ;

            fs.writeFile(jsonFilePath, JSON.stringify(questions, null, 2), (err) => {
                if (err) return handleFileError(err, res, 'Failed to update the FAQ');
                runScript(jsonToCsvScriptPath, res, 'FAQ updated and CSV refreshed successfully.', 'Failed to convert JSON to CSV');
            });
        } else {
            res.status(404).send({ error: 'FAQ not found' });
        }
    });
});

// Delete FAQ by index
router.delete('/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) return handleFileError(err, res, 'Failed to read questions data');

        const questions = JSON.parse(data);

        if (index >= 0 && index < questions.length) {
            questions.splice(index, 1);

            fs.writeFile(jsonFilePath, JSON.stringify(questions, null, 2), (err) => {
                if (err) return handleFileError(err, res, 'Failed to delete the FAQ');
                runScript(jsonToCsvScriptPath, res, 'FAQ deleted and CSV updated successfully.', 'Failed to convert JSON to CSV');
            });
        } else {
            res.status(404).send({ error: 'FAQ not found' });
        }
    });
});

// Upload and replace FAQs
router.post('/upload', upload.single('file'), (req, res) => {
    const tempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const jsonTargetPath = path.join(__dirname, '../data/BU_MET_FAQs.json');
    const csvTargetPath = path.join(__dirname, '../data/BU_MET_FAQs.csv');

    const handleFileMove = (sourcePath, targetPath, callback) => {
        fs.rename(sourcePath, targetPath, (err) => {
            if (err) return handleFileError(err, res, 'Failed to upload the file');
            callback(); // Invoke the callback to continue the flow
        });
    };

    if (ext === '.json') {
        handleFileMove(tempPath, jsonTargetPath, () => {
            res.send({ success: true, message: 'JSON file uploaded and replaced successfully.' });
        });
    } else if (ext === '.csv') {
        handleFileMove(tempPath, csvTargetPath, () => {
            runScript(csvToJsonScriptPath, res, 'CSV converted to JSON and replaced successfully.', 'Failed to convert CSV to JSON');
        });
    } else {
        fs.unlink(tempPath, err => {
            if (err) console.error('Error deleting file:', err);
            res.status(400).send({ error: 'Only JSON or CSV files are allowed.' });
        });
    }
});

// Download FAQs as ZIP
router.get('/download', (req, res) => {
    const zipFilePath = path.join(__dirname, '../data/BU_MET_FAQs.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', err => { throw err; });
    output.on('close', () => res.download(zipFilePath, 'BU_MET_FAQs.zip'));
    archive.pipe(output);

    archive.file(path.join(__dirname, '../data/BU_MET_FAQs.json'), { name: 'BU_MET_FAQs.json' });
    archive.file(path.join(__dirname, '../data/BU_MET_FAQs.csv'), { name: 'BU_MET_FAQs.csv' });
    archive.finalize();
});

module.exports = router;
