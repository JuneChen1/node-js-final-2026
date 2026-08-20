const express = require('express');
const courseController = require('../controllers/course');
const router = express.Router();

router.get('/', courseController.getActiveCourses);

module.exports = router;
