const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
  secure: true
});

const uploadController = {
  async uploadImage(req, res, next) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream((error, uploadResult) => {
            if (error) return reject(error);
            return resolve(uploadResult);
          })
          .end(req.file.buffer);
      });

      res.status(200).json({
        status: 'success',
        data: {
          image_url: uploadResult.secure_url
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = uploadController;
