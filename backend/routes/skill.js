const express = require('express');
const skillController = require('../controllers/skill');
const router = express.Router();

router.get('/', skillController.getSkills);
router.post('/', skillController.postSkill);
router.delete('/:skillId', skillController.deleteSkill);

module.exports = router;
