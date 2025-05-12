const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const auth = require('../middleware/auth');

// Protected routes - require authentication
router.post('/upload', auth, assetController.uploadAsset);
router.get('/', auth, assetController.getAllAssets);
router.get('/search', auth, assetController.searchAssets);
router.get('/:id', auth, assetController.getAssetById);
router.put('/:id', auth, assetController.updateAsset);
router.delete('/:id', auth, assetController.deleteAsset);

module.exports = router; 