const request = require('supertest');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const app = require('../index');

describe('Cloudinary File Operations', () => {
    let uploadedFilePublicId;
    const testFilePath = path.join(__dirname, 'test-image.jpg');

    // Setup before all tests
    beforeAll(async () => {
        // Create a simple test image
        const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(testFilePath, testImage);
    });

    // Cleanup after all tests
    afterAll(async () => {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
        // Close MongoDB connection
        await mongoose.connection.close();
    });

    // Test file upload
    test('should upload a file successfully', async () => {
        const response = await request(app)
            .post('/api/files/upload')
            .attach('file', testFilePath)
            .field('folder', 'test-uploads')
            .field('tags', 'test,automated');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('File uploaded successfully');
        expect(response.body.data).toHaveProperty('url');
        expect(response.body.data).toHaveProperty('public_id');
        
        // Store public_id for later tests
        uploadedFilePublicId = response.body.data.public_id;
        console.log('Uploaded file public_id:', uploadedFilePublicId);
    });

    // Test get file details
    test('should get file details', async () => {
        console.log('Testing get file details with public_id:', uploadedFilePublicId);
        const response = await request(app)
            .get(`/api/files/details/${uploadedFilePublicId}`);

        console.log('Get file details response:', response.body);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('File details retrieved successfully');
        expect(response.body.data).toHaveProperty('url');
        expect(response.body.data).toHaveProperty('public_id', uploadedFilePublicId);
    });

    // Test update file tags
    test('should update file tags', async () => {
        console.log('Testing update tags with public_id:', uploadedFilePublicId);
        const response = await request(app)
            .put(`/api/files/tags/${uploadedFilePublicId}`)
            .send({
                tags: ['updated', 'test-tag']
            });

        console.log('Update tags response:', response.body);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('File tags updated successfully');
        expect(response.body.data).toHaveProperty('tags');
    });

    // Test delete file
    test('should delete file', async () => {
        console.log('Testing delete file with public_id:', uploadedFilePublicId);
        const response = await request(app)
            .delete(`/api/files/delete/${uploadedFilePublicId}`);

        console.log('Delete file response:', response.body);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('File deleted successfully');
    });
}); 