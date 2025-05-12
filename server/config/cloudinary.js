const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Debug Cloudinary configuration
console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : undefined
});

// Validate environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary configuration. Please check your .env file.');
    process.exit(1);
}

// Configure Cloudinary with current timestamp
const currentTimestamp = Math.floor(Date.now() / 1000);
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timestamp: currentTimestamp
});

// Log the configuration timestamp
console.log('Cloudinary configuration timestamp:', new Date(currentTimestamp * 1000).toISOString());

module.exports = cloudinary; 