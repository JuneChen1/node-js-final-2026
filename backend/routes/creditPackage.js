const express = require('express');
const creditPackageController = require('../controllers/creditPackage');
const router = express.Router();

router.get('/', creditPackageController.getCreditPackages);
router.post('/', creditPackageController.postCreditPackage);
router.delete('/:creditPackageId', creditPackageController.deleteCreditPackage);

module.exports = router;
