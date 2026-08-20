const { In } = require('typeorm');
const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const {
  isPositiveInteger,
  isValidUUID,
  isValidString,
  isValidUrl,
  isValidTimestamp
} = require('../utils/validUtils');

const coachController = {
  async upgradeToCoach(req, res, next) {
    const userId = req.params.userId;
    const { experience_years, description, profile_image_url } = req.body;
    if (
      !isValidUUID(userId) ||
      !isPositiveInteger(experience_years) ||
      !isValidString(description)
    ) {
      return next(appError(400, '欄位未填寫正確'));
    }
    if (
      profile_image_url !== '' &&
      profile_image_url !== undefined &&
      !isValidUrl(profile_image_url)
    ) {
      return next(appError(400, '欄位未填寫正確'));
    }

    try {
      const userRepo = dataSource.getRepository('User');
      const findUser = await userRepo.findOneBy({ id: userId });
      if (!findUser) {
        return next(appError(400, '使用者不存在'));
      }
      if (findUser.role === 'COACH') {
        return next(appError(409, '使用者已經是教練'));
      }
      await userRepo.save({
        ...findUser,
        role: 'COACH'
      });

      const coachRepo = dataSource.getRepository('Coach');
      const addToCoach = await coachRepo.save({
        experience_years,
        description: description === undefined ? null : description,
        profile_image_url:
          profile_image_url === undefined ? null : profile_image_url,
        user: { id: userId }
      });
      const { user, ...coach } = addToCoach;

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            name: findUser.name,
            role: 'COACH'
          },
          coach: {
            ...coach,
            user_id: user.id
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async getCoachProfile(req, res, next) {
    try {
      const coachRepo = dataSource.getRepository('Coach');
      const linkRepo = dataSource.getRepository('CoachLinkSkill');
      const findCoach = await coachRepo.findOneBy({
        user: { id: req.user.id }
      });
      const linkSkill = await linkRepo.find({
        where: { coach: { id: findCoach.id } },
        relations: { skill: true },
        select: { skill: { id: true } }
      });

      res.status(200).json({
        status: 'success',
        data: {
          id: findCoach.id,
          experience_years: findCoach.experience_years,
          description: findCoach.description,
          profile_image_url: findCoach.profile_image_url,
          skill_ids: linkSkill.map((item) => item.skill.id)
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async updateCoachProfile(req, res, next) {
    const { experience_years, description, profile_image_url, skill_ids } =
      req.body;
    if (
      !isPositiveInteger(experience_years) ||
      !isValidString(description) ||
      !isValidUrl(profile_image_url)
    ) {
      return next(appError(400, '欄位未填寫正確'));
    }
    if (!Array.isArray(skill_ids) || skill_ids.length === 0) {
      return next(appError(400, '欄位未填寫正確'));
    }

    const invalidSkillId = skill_ids.filter((skill) => !isValidUUID(skill));
    if (invalidSkillId.length !== 0) {
      return next(appError(400, '欄位未填寫正確'));
    }
    try {
      const coachRepo = dataSource.getRepository('Coach');
      const linkRepo = dataSource.getRepository('CoachLinkSkill');
      const findCoach = await coachRepo.findOneBy({
        user: { id: req.user.id }
      });
      const updateCoach = await coachRepo.save({
        ...findCoach,
        experience_years,
        description,
        profile_image_url
      });

      await linkRepo.delete({ coach: { id: findCoach.id } });

      const newSkills = skill_ids.map((item) => {
        return { coach: { id: findCoach.id }, skill: { id: item } };
      });
      await linkRepo.save(newSkills);

      res.status(200).json({
        status: 'success',
        data: {
          id: updateCoach.id,
          experience_years: updateCoach.experience_years,
          description: updateCoach.description,
          profile_image_url: updateCoach.profile_image_url,
          skill_ids
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = coachController;
