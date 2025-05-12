const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const File = require('../models/File');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images, videos, documents
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/x-msvideo',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
        }
    }
});

// Upload file to Cloudinary
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        console.log('Attempting to upload file to Cloudinary...');
        // Get current timestamp
        const timestamp = Math.floor(Date.now() / 1000);
        console.log('Upload timestamp:', new Date(timestamp * 1000).toISOString());

        // Upload to Cloudinary with additional options
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: req.body.folder || 'uploads',
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            tags: req.body.tags ? req.body.tags.split(',') : [],
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ],
            timestamp: timestamp
        });
        console.log('Upload successful:', result.public_id);

        // Save file metadata to MongoDB with user ID
        const fileDoc = new File({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes,
            created_at: result.created_at,
            tags: result.tags,
            folder: req.body.folder || '',
            name: req.file.originalname,
            userId: req.user._id // Associate file with the uploading user
        });
        await fileDoc.save();

        res.status(200).json({
            message: 'File uploaded successfully',
            data: {
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                size: result.bytes,
                created_at: result.created_at,
                tags: result.tags,
                folder: req.body.folder || '',
                name: req.file.originalname
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        // Handle specific Cloudinary errors
        if (error.message.includes('Stale request')) {
            return res.status(400).json({ 
                message: 'Upload failed due to time synchronization issue. Please check your system time.',
                error: error.message 
            });
        }
        res.status(500).json({ 
            message: 'Error uploading file', 
            error: error.message 
        });
    }
};

// Delete file from Cloudinary and MongoDB
const deleteFile = async (req, res) => {
    try {
        let { public_id } = req.params;
        
        if (!public_id) {
            return res.status(400).json({ message: 'Public ID is required' });
        }

        console.log('Attempting to delete file from Cloudinary:', public_id);
        
        // Fetch the file from MongoDB to get its format and verify ownership
        const fileDoc = await File.findOne({ public_id, userId: req.user._id });
        if (!fileDoc) {
            return res.status(404).json({ message: 'File not found or unauthorized' });
        }

        // Determine resource_type based on file format
        let resourceType = 'raw'; // default
        if (fileDoc.format && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileDoc.format)) {
            resourceType = 'image';
        } else if (fileDoc.format && ['mp4', 'mov', 'avi'].includes(fileDoc.format)) {
            resourceType = 'video';
        }

        // First try to delete from Cloudinary
        try {
            const cloudinaryResult = await cloudinary.uploader.destroy(public_id, {
                invalidate: true, // Invalidate CDN cache
                resource_type: resourceType // Use determined resource_type
            });
            console.log('Cloudinary delete result:', cloudinaryResult);
            
            if (cloudinaryResult.result !== 'ok') {
                throw new Error(`Cloudinary deletion failed: ${cloudinaryResult.result}`);
            }
        } catch (cloudinaryError) {
            console.error('Cloudinary deletion error:', cloudinaryError);
            // If the file doesn't exist in Cloudinary, we can still proceed with MongoDB deletion
            if (cloudinaryError.http_code !== 404) {
                throw cloudinaryError;
            }
        }
        
        // Then delete from MongoDB
        const mongoResult = await File.findOneAndDelete({ public_id, userId: req.user._id });
        console.log('MongoDB delete result:', mongoResult);
        
        if (!mongoResult) {
            return res.status(404).json({ 
                message: 'File not found in database',
                data: { public_id }
            });
        }
        
        res.status(200).json({ 
            message: 'File deleted successfully',
            data: {
                public_id: public_id,
                mongo_result: mongoResult
            }
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(error.http_code || 500).json({ 
            message: 'Error deleting file', 
            error: error.message 
        });
    }
};

// Get file details
const getFileDetails = async (req, res) => {
    try {
        const { public_id } = req.params;
        
        if (!public_id) {
            return res.status(400).json({ message: 'Public ID is required' });
        }

        // First check if the user owns this file
        const fileDoc = await File.findOne({ public_id, userId: req.user._id });
        if (!fileDoc) {
            return res.status(404).json({ message: 'File not found or unauthorized' });
        }

        console.log('Attempting to get file details for:', public_id);
        const result = await cloudinary.api.resource(public_id);
        console.log('Got file details:', result.public_id);
        
        res.status(200).json({
            message: 'File details retrieved successfully',
            data: {
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                size: result.bytes,
                created_at: result.created_at,
                tags: result.tags
            }
        });
    } catch (error) {
        console.error('Get file details error:', error);
        res.status(error.http_code || 500).json({ 
            message: 'Error retrieving file details', 
            error: error.message 
        });
    }
};

// Update file tags
const updateFileTags = async (req, res) => {
    try {
        const { public_id } = req.params;
        const { tags } = req.body;
        
        if (!public_id) {
            return res.status(400).json({ message: 'Public ID is required' });
        }

        if (!tags || !Array.isArray(tags)) {
            return res.status(400).json({ message: 'Tags array is required' });
        }

        // First check if the user owns this file
        const fileDoc = await File.findOne({ public_id, userId: req.user._id });
        if (!fileDoc) {
            return res.status(404).json({ message: 'File not found or unauthorized' });
        }

        console.log('Attempting to update tags for:', public_id);
        const result = await cloudinary.uploader.add_tag(tags, [public_id]);
        console.log('Tags updated:', result);
        
        res.status(200).json({
            message: 'File tags updated successfully',
            data: {
                public_id: public_id,
                tags: tags,
                result: result
            }
        });
    } catch (error) {
        console.error('Update tags error:', error);
        res.status(error.http_code || 500).json({ 
            message: 'Error updating file tags', 
            error: error.message 
        });
    }
};

// List all files from MongoDB for the current user
const getAllFiles = async (req, res) => {
    try {
        const files = await File.find({ userId: req.user._id });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadFile,
    deleteFile,
    getFileDetails,
    updateFileTags,
    upload,
    getAllFiles
}; 