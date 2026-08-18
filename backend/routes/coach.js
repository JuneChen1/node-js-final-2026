const express = require('express');
const coachController = require('../controllers/coach');
const isAuth = require('../middlewares/isAuth');
const isCoach = require('../middlewares/isCoach');
const router = express.Router();

router.get('/courses/:courseId', isAuth, coachController.getCourseInfo);
router.put('/courses/:courseId', isAuth, coachController.updateCourse);

router.get('/courses', isAuth, isCoach, coachController.getCourses);
router.post('/courses', isAuth, isCoach, coachController.addNewCourse);

router.post('/:userId', coachController.upgradeToCoach);
router.get('/', isAuth, isCoach, coachController.getCoachProfile);
router.put('/', isAuth, isCoach, coachController.updateCoachProfile);

module.exports = router;
