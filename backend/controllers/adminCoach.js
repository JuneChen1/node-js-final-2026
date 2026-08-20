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
  },
  async addNewCourse(req, res, next) {
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url
    } = req.body;
    if (
      !isValidUUID(skill_id) ||
      !isValidString(name) ||
      !isValidString(description) ||
      !isValidTimestamp(start_at) ||
      !isValidTimestamp(end_at) ||
      !isPositiveInteger(max_participants) ||
      !isValidUrl(meeting_url)
    ) {
      return next(appError(400, '欄位未填寫正確'));
    }

    try {
      const courseRepo = dataSource.getRepository('Course');
      const saveCourse = await courseRepo.save({
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
        user: { id: req.user.id },
        skill: { id: skill_id }
      });
      const { user, skill, ...course } = saveCourse;

      res.status(201).json({
        status: 'success',
        data: {
          course: {
            ...course,
            user_id: user.id,
            skill_id: skill.id
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async getCourseInfo(req, res, next) {
    const courseId = req.params.courseId;
    try {
      const courseRepo = dataSource.getRepository('Course');
      const findCourse = await courseRepo.findOne({
        where: { id: courseId },
        relations: { skill: true, user: true }
      });

      if (!findCourse || findCourse.user.id !== req.user.id) {
        return next(appError(400, '課程不存在'));
      }
      const { user, skill, ...course } = findCourse;

      res.status(200).json({
        status: 'success',
        data: {
          ...course,
          skill_name: skill.name,
          skill_id: skill.id
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async updateCourse(req, res, next) {
    const courseId = req.params.courseId;
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url
    } = req.body;
    if (
      !isValidUUID(skill_id) ||
      !isValidString(name) ||
      !isValidString(description) ||
      !isValidTimestamp(start_at) ||
      !isValidTimestamp(end_at) ||
      !isPositiveInteger(max_participants) ||
      !isValidUrl(meeting_url)
    ) {
      return next(appError(400, '欄位未填寫正確'));
    }

    try {
      const courseRepo = dataSource.getRepository('Course');
      const findCourse = await courseRepo.findOne({
        where: { id: courseId },
        relations: { skill: true, user: true }
      });
      if (!findCourse || findCourse.user.id !== req.user.id) {
        return next(appError(400, '課程不存在'));
      }

      const saveCourse = await courseRepo.save({
        ...findCourse,
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
        skill: { id: skill_id }
      });

      const { user, skill, ...course } = saveCourse;

      res.status(200).json({
        status: 'success',
        data: {
          course: {
            ...course,
            user_id: user.id,
            skill_id: skill.id
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async getCourses(req, res, next) {
    try {
      const courseRepo = dataSource.getRepository('Course');
      const courseBookingRepo = dataSource.getRepository('CourseBooking');

      const findCourses = await courseRepo.find({
        where: { user: { id: req.user.id } }
      });
      const findBookings = await courseBookingRepo.query(
        'SELECT c.id AS course_id, COUNT(*) AS count FROM course_bookings cb JOIN courses c ON cb.course_id = c.id WHERE c.user_id = $1 AND cb.cancelled_at IS NULL GROUP BY c.id',
        [req.user.id]
      );

      const data = [];
      const now = new Date();
      if (findCourses.length > 0) {
        for (const course of findCourses) {
          let status;
          if (new Date(course.start_at) > now) {
            status = '尚未開始';
          } else if (new Date(course.end_at) <= now) {
            status = '已結束';
          } else {
            status = '進行中';
          }

          const bookingCount = findBookings.find(
            (item) => item.course_id === course.id
          );

          data.push({
            id: course.id,
            name: course.name,
            status,
            start_at: course.start_at,
            end_at: course.end_at,
            max_participants: course.max_participants,
            meeting_url: course.meeting_url,
            participants:
              bookingCount === undefined ? 0 : Number(bookingCount.count)
          });
        }
      }

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
