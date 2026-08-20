const { MoreThan } = require('typeorm');
const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const { isPositiveInteger, isValidUUID } = require('../utils/validUtils');

const coachController = {
  async getCoachesPagination(req, res, next) {
    const per = Number(req.query.per);
    const page = Number(req.query.page);
    if (!isPositiveInteger(per) || !isPositiveInteger(page)) {
      return next(appError(400, '欄位未填寫正確'));
    }

    try {
      const coachRepo = dataSource.getRepository('Coach');
      const coaches = await coachRepo.find({
        skip: per * (page - 1),
        take: per,
        relations: { user: true }
      });

      const data = coaches.map((item) => {
        return {
          id: item.id,
          user_id: item.user.id,
          name: item.user.name
        };
      });

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  },
  async getCoachInfo(req, res, next) {
    const { coachId } = req.params;
    if (!isValidUUID(coachId)) {
      return next(appError(400, '欄位未填寫正確'));
    }
    try {
      const coachRepo = dataSource.getRepository('Coach');
      const findCoach = await coachRepo.findOne({
        where: { id: coachId },
        relations: { user: true }
      });
      if (!findCoach) {
        return next(appError(400, '找不到該教練'));
      }

      const linkRepo = dataSource.getRepository('CoachLinkSkill');
      const findSkills = await linkRepo.find({
        where: { coach: { id: coachId } },
        relations: { skill: true },
        select: { id: true, skill: { name: true } }
      });

      const { user, ...coach } = findCoach;

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            name: user.name,
            role: user.role
          },
          coach: {
            ...coach,
            user_id: user.id,
            skills: findSkills.map((skill) => skill.name)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async getCoachActiveCourses(req, res, next) {
    const { coachId } = req.params;
    if (!isValidUUID(coachId)) {
      return next(appError(400, '欄位未填寫正確'));
    }
    try {
      const coachRepo = dataSource.getRepository('Coach');
      const findCoach = await coachRepo.findOne({
        where: { id: coachId },
        relations: { user: true }
      });
      if (!findCoach) {
        return next(appError(400, '找不到該教練'));
      }

      const courseRepo = dataSource.getRepository('Course');
      const findCourses = await courseRepo.find({
        where: {
          user: { id: findCoach.user.id },
          end_at: MoreThan(new Date())
        },
        relations: { skill: true }
      });

      const data = findCourses.map((item) => {
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          start_at: item.start_at,
          end_at: item.end_at,
          max_participants: item.max_participants,
          coach_name: findCoach.user.name,
          skill_name: item.skill.name
        };
      });

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = coachController;
