const express = require('express');
const coachController = require('../controllers/coach');
const router = express.Router();

router.get('/:coachId/courses', coachController.getCoachActiveCourses);
router.get('/:coachId', coachController.getCoachInfo);
router.get('/', coachController.getCoachesPagination);

module.exports = router;
