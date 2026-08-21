const express = require('express');
const creditPackageController = require('../controllers/creditPackage');
const isAuth = require('../middlewares/isAuth');
const router = express.Router();

router.post('/:creditPackageId', isAuth, creditPackageController.purchase);
router.delete('/:creditPackageId', creditPackageController.deleteCreditPackage);
router.get('/', creditPackageController.getCreditPackages);
router.post('/', creditPackageController.postCreditPackage);

module.exports = router;
