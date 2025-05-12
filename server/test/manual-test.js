const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/files';

async function testFileOperations() {
    try {
        // 1. Upload a test file
        console.log('Testing file upload...');
        const formData = new FormData();
        const testImagePath = path.join(__dirname, 'test-image.jpg');
        
        // Create a test image if it doesn't exist
        if (!fs.existsSync(testImagePath)) {
            const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
            fs.writeFileSync(testImagePath, testImage);
        }

        formData.append('file', fs.createReadStream(testImagePath));
        formData.append('folder', 'test-uploads');
        formData.append('tags', 'test,manual');

        const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('Upload successful:', uploadResponse.data);
        const publicId = uploadResponse.data.data.public_id;

        // 2. Get file details
        console.log('\nTesting get file details...');
        const detailsResponse = await axios.get(`${API_URL}/details/${publicId}`);
        console.log('File details:', detailsResponse.data);

        // 3. Update file tags
        console.log('\nTesting update file tags...');
        const updateResponse = await axios.put(`${API_URL}/tags/${publicId}`, {
            tags: ['updated', 'manual-test']
        });
        console.log('Tags updated:', updateResponse.data);

        // 4. Delete file
        console.log('\nTesting file deletion...');
        const deleteResponse = await axios.delete(`${API_URL}/delete/${publicId}`);
        console.log('File deleted:', deleteResponse.data);

        // Clean up test file
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }

    } catch (error) {
        console.error('Error during testing:', error.response?.data || error.message);
    }
}

// Run the tests
testFileOperations(); 