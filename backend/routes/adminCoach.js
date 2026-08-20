const express = require('express');
const adminCoachController = require('../controllers/adminCoach');
const isAuth = require('../middlewares/isAuth');
const isCoach = require('../middlewares/isCoach');
const router = express.Router();

router.get('/courses/:courseId', isAuth, adminCoachController.getCourseInfo);
router.put('/courses/:courseId', isAuth, adminCoachController.updateCourse);

router.get('/courses', isAuth, isCoach, adminCoachController.getCourses);
router.post('/courses', isAuth, isCoach, adminCoachController.addNewCourse);

router.post('/:userId', adminCoachController.upgradeToCoach);
router.get('/', isAuth, isCoach, adminCoachController.getCoachProfile);
router.put('/', isAuth, isCoach, adminCoachController.updateCoachProfile);

module.exports = router;
