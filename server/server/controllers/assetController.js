const Asset = require('../models/Asset');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
}).single('file');

// Upload asset
exports.uploadAsset = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const asset = new Asset({
        name: req.file.originalname,
        type: path.extname(req.file.originalname).slice(1),
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        tags: req.body.tags ? req.body.tags.split(',') : [],
        category: req.body.category,
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
        uploadedBy: req.user._id
      });

      await asset.save();
      res.status(201).json(asset);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all assets with pagination and filters
exports.getAllAssets = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }

    const assets = await Asset.find(query)
      .populate('uploadedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Asset.countDocuments(query);

    res.json({
      assets,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get asset by ID
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('accessLogs.user', 'name email');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Log access
    asset.accessLogs.push({
      user: req.user._id,
      action: 'view'
    });
    await asset.save();

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update asset
exports.updateAsset = async (req, res) => {
  try {
    const { tags, category, metadata } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (tags) asset.tags = tags.split(',');
    if (category) asset.category = category;
    if (metadata) asset.metadata = JSON.parse(metadata);

    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Delete file from storage
    const filePath = path.join(__dirname, '..', asset.url);
    fs.unlinkSync(filePath);

    await asset.remove();
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search assets
exports.searchAssets = async (req, res) => {
  try {
    const { query, category, type } = req.query;
    const searchQuery = {};

    if (query) {
      searchQuery.$text = { $search: query };
    }
    if (category) searchQuery.category = category;
    if (type) searchQuery.type = type;

    const assets = await Asset.find(searchQuery)
      .populate('uploadedBy', 'name email')
      .sort({ score: { $meta: 'textScore' } });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 