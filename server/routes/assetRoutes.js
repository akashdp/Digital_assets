const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

// Get all assets
router.get('/', assetController.getAllAssets);

// Search assets
router.get('/search', assetController.searchAssets);

// Get assets by tag
router.get('/tag/:tag', assetController.getAssetsByTag);

// Get asset by ID
router.get('/:id', assetController.getAssetById);

// Create new asset
router.post('/', assetController.createAsset);

// Update asset
router.put('/:id', assetController.updateAsset);

// Delete asset
router.delete('/:id', assetController.deleteAsset);

module.exports = router; 