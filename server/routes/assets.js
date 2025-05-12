const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Asset = require('../models/Asset');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Upload a file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = req.user;
    const newSize = user.storageUsed + req.file.size;

    if (newSize > user.storageLimit) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Storage limit exceeded' });
    }

    const asset = new Asset({
      name: req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      owner: user._id,
      folder: req.body.folder || '/'
    });

    await asset.save();

    // Update user's storage usage
    user.storageUsed = newSize;
    await user.save();

    res.status(201).json(asset);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get all assets for the current user
router.get('/', auth, async (req, res) => {
  try {
    const assets = await Asset.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assets' });
  }
});

// Get asset by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, owner: req.user._id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching asset' });
  }
});

// Delete asset
router.delete('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, owner: req.user._id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Delete file from storage
    fs.unlinkSync(asset.path);

    // Update user's storage usage
    const user = req.user;
    user.storageUsed -= asset.size;
    await user.save();

    // Delete asset from database
    await asset.deleteOne();

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting asset' });
  }
});

// Get user's storage info
router.get('/storage/info', auth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      used: user.storageUsed,
      limit: user.storageLimit,
      percentage: (user.storageUsed / user.storageLimit) * 100
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching storage info' });
  }
});

module.exports = router; 