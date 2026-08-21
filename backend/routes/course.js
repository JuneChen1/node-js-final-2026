const express = require('express');
const courseController = require('../controllers/course');
const isAuth = require('../middlewares/isAuth');
const router = express.Router();

router.post('/:courseId', isAuth, courseController.createBooking);
router.delete('/:courseId', isAuth, courseController.deleteBooking);
router.get('/', courseController.getActiveCourses);

module.exports = router;
