const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const config = require('../config/config');

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const storage_image = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nft-marketplace/image',
    resource_type: 'image',
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const delete_image = (imagePath) => {
  const publicId =
    'nft-marketplace/image' + imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('.'));
  cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      console.error('Error deleting avatar from Cloudinary', error);
    }
    console.log('Removed avatar from Cloudinary', result);
  });
};

const uploadImage = multer({
  storage: storage_image,
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, .png, and .gif file formats are allowed'));
    }
  },
});

module.exports = { uploadImage, delete_image };
