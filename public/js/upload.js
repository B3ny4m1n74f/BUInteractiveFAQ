document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.querySelector('.upload-btn');
    const dropArea = document.querySelector('.drop-area');
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB in bytes

    // Function to validate file type and size
    function validateFile(file) {
        const allowedExtensions = ['json', 'csv'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            alert(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`);
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert('File size exceeds the 100 MB limit.');
            return false;
        }
        return true;
    }

    // Function to handle file upload
    async function uploadFile(file) {
        if (!validateFile(file)) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/questions/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('File uploaded successfully');
            } else {
                alert(`File upload failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('An error occurred while uploading the file. Please try again.');
        }
    }

    // Event handler for file selection via button click
    uploadButton.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json, .csv';
        fileInput.click();

        fileInput.onchange = () => {
            const file = fileInput.files[0];
            if (file) {
                uploadFile(file);
            }
        };
    });

    // Event handlers for drag-and-drop functionality
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.classList.remove('dragover');
        const file = event.dataTransfer.files[0];
        if (file) {
            uploadFile(file);
        }
    });
});
