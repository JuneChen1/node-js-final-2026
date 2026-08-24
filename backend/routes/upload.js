const express = require('express');
const uploadController = require('../controllers/upload');
const isAuth = require('../middlewares/isAuth');
const isValidImage = require('../middlewares/isValidImage');
const router = express.Router();

router.post('/', isAuth, isValidImage, uploadController.uploadImage);

module.exports = router;
