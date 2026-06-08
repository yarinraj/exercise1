const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // prevent duplicate usernames
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  profileImage: {
    type: String, // saving the image as a base64 string or a URL
    required: true // image is also required for user registration
  }
}, { timestamps: true }); // automatically adds createdAt and updatedAt fields

// creating and exporting the User model based on the userSchema
const User = mongoose.model('User', userSchema);
module.exports = User;