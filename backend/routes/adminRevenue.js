const express = require('express');
const adminRevenueController = require('../controllers/adminRevenue');
const isAuth = require('../middlewares/isAuth');
const isCoach = require('../middlewares/isCoach');
const router = express.Router();

router.get('/', isAuth, isCoach, adminRevenueController.getRevenue);

module.exports = router;
