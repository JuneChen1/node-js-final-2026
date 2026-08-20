const { MoreThan, LessThanOrEqual } = require('typeorm');
const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');

const courseController = {
  async getActiveCourses(req, res, next) {
    try {
      const now = new Date();
      const courseRepo = dataSource.getRepository('Course');
      const findCourses = await courseRepo.find({
        where: { start_at: LessThanOrEqual(now), end_at: MoreThan(now) },
        relations: { user: true, skill: true }
      });
      const data = findCourses.map((course) => {
        return {
          id: course.id,
          name: course.name,
          description: course.description,
          start_at: course.start_at,
          end_at: course.end_at,
          max_participants: course.max_participants,
          coach_name: course.user.name,
          skill_name: course.skill.name
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

module.exports = courseController;
