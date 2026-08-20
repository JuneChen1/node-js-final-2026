const express = require('express');
const adminCourseController = require('../controllers/adminCourse');
const isAuth = require('../middlewares/isAuth');
const isCoach = require('../middlewares/isCoach');
const router = express.Router();

router.get('/:courseId', isAuth, adminCourseController.getCourseInfo);
router.put('/:courseId', isAuth, adminCourseController.updateCourse);

router.get('/', isAuth, isCoach, adminCourseController.getCourses);
router.post('/', isAuth, isCoach, adminCourseController.addNewCourse);

module.exports = router;
