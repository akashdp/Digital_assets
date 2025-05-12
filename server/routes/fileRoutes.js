const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile, getFileDetails, updateFileTags, upload, getAllFiles } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

// All file routes require authentication
router.use(protect);

// Route for file upload
router.post('/upload', upload.single('file'), uploadFile);

// Route for listing all files (user-specific)
router.get('/', getAllFiles);

// Route for file deletion
router.delete('/delete/*', async (req, res) => {
    try {
        // Get the encoded public_id from the wildcard parameter
        const encodedPublicId = req.params[0];
        console.log('--- DELETE ROUTE DEBUG ---');
        console.log('Request URL:', req.originalUrl);
        console.log('Encoded public_id (req.params[0]):', encodedPublicId);
        
        // Decode the public_id
        const public_id = decodeURIComponent(encodedPublicId);
        console.log('Decoded public_id:', public_id);
        
        if (!public_id) {
            return res.status(400).json({ message: 'Public ID is required' });
        }
        
        req.params.public_id = public_id;
        await deleteFile(req, res);
    } catch (error) {
        console.error('Error in delete route:', error);
        res.status(500).json({ 
            message: error.message || 'Error deleting file',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Route for getting file details
router.get('/details/*', async (req, res) => {
    try {
        const public_id = decodeURIComponent(req.params[0]);
        if (!public_id) {
            return res.status(400).json({ message: 'Public ID is required' });
        }
        req.params.public_id = public_id;
        await getFileDetails(req, res);
    } catch (error) {
        console.error('Error in get details route:', error);
        res.status(500).json({ 
            message: error.message || 'Error getting file details',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Route for updating file tags
router.put('/tags/*', async (req, res) => {
    try {
        const public_id = decodeURIComponent(req.params[0]);
        if (!public_id) {
            return res.status(400).json({ message: 'Public ID is required' });
        }
        req.params.public_id = public_id;
        await updateFileTags(req, res);
    } catch (error) {
        console.error('Error in update tags route:', error);
        res.status(500).json({ 
            message: error.message || 'Error updating file tags',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router; 