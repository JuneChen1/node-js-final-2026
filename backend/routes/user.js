const express = require('express');
const userController = require('../controllers/user');
const isAuth = require('../middlewares/isAuth');
const router = express.Router();

router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.get('/profile', isAuth, userController.getProfile);
router.put('/profile', isAuth, userController.updateProfileName);
router.put('/password', isAuth, userController.updatePassword);

module.exports = router;
