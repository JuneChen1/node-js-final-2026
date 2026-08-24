const multer = require('multer');
const sharp = require('sharp');
const appError = require('../utils/appError');

const maxMbSize = 2;
const availableFormat = ['jpeg', 'png'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxMbSize * 1024 * 1024 }
}).single('file');

async function isValidImage(req, res, next) {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(appError(400, `檔案大小不可大於${maxMbSize}MB`));
      }
      return next(err);
    }

    if (!req.file) {
      return next(appError(400, '請上傳圖片'));
    }

    try {
      const metadata = await sharp(req.file.buffer).metadata();
      if (!availableFormat.includes(metadata.format)) {
        return next(appError(400, '不支援的圖片格式'));
      }
    } catch (err) {
      return next(appError(400, '無法解析圖片檔案'));
    }
    next();
  });
}

module.exports = isValidImage;
