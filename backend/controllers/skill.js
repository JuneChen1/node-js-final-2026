const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const { isValidString } = require('../utils/validUtils');

const skillController = {
  async getSkills(req, res, next) {
    try {
      const skillRepo = dataSource.getRepository('Skill');
      const data = await skillRepo.find({ select: { id: true, name: true } });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  async postSkill(req, res, next) {
    const skillName = req.body.name;
    if (!isValidString(skillName)) {
      next(appError(400, '欄位未填寫正確'));
      return;
    }
    try {
      const skillRepo = dataSource.getRepository('Skill');
      const existing = await skillRepo.findOneBy({ name: skillName.trim() });
      if (existing) {
        next(appError(409, '資料重複'));
        return;
      }

      const data = await skillRepo.save({ name: skillName.trim() });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  async deleteSkill(req, res, next) {
    try {
      const { skillId } = req.params;
      const skillRepo = dataSource.getRepository('Skill');
      const result = await skillRepo.delete(skillId);
      if (result.affected === 0) {
        next(appError(400, 'ID錯誤'));
        return;
      }
      res.status(200).json({
        status: 'success',
        data: {
          raw: result.raw,
          affected: result.affected
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = skillController;
