const mongoose = require('mongoose');
const FileSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  format: String,
  size: Number,
  created_at: Date,
  tags: [String],
  folder: String,
  name: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});
module.exports = mongoose.model('File', FileSchema); 