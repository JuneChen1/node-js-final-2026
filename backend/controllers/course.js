const { MoreThan, LessThanOrEqual, IsNull } = require('typeorm');
const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const { isValidUUID } = require('../utils/validUtils');

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
  },
  async createBooking(req, res, next) {
    const { courseId } = req.params;
    if (!isValidUUID(courseId)) {
      return next(appError(400, 'ID錯誤'));
    }
    try {
      const courseRepo = dataSource.getRepository('Course');
      const findCourse = await courseRepo.findOneBy({ id: courseId });
      if (!findCourse) {
        return next(appError(400, 'ID錯誤'));
      }

      const bookingRepo = dataSource.getRepository('CourseBooking');
      const findBooking = await bookingRepo.findOneBy({
        user: { id: req.user.id },
        course: { id: courseId }
      });
      if (findBooking) {
        return next(appError(400, '已經報名過此課程'));
      }

      const purchaseRepo = dataSource.getRepository('CreditPurchase');
      const findPurchases = await purchaseRepo.find({
        where: { user: { id: req.user.id } }
      });
      const totalCredit = findPurchases.reduce(
        (acc, cur) => cur.purchased_credits + acc,
        0
      );
      const usageCount = await bookingRepo.count({
        where: { user: { id: req.user.id }, cancelled_at: IsNull() }
      });
      if (totalCredit - usageCount <= 0) {
        return next(appError(400, '已無可使用堂數'));
      }

      const participantCount = await bookingRepo.count({
        where: { course: { id: courseId }, cancelled_at: IsNull() }
      });
      if (participantCount >= findCourse.max_participants) {
        return next(appError(400, '已達最大參加人數，無法參加'));
      }

      await bookingRepo.save({
        user: { id: req.user.id },
        course: { id: courseId }
      });

      res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  },
  async deleteBooking(req, res, next) {
    const { courseId } = req.params;
    if (!isValidUUID(courseId)) {
      return next(appError(400, 'ID錯誤'));
    }
    try {
      const bookingRepo = dataSource.getRepository('CourseBooking');
      const findBooking = await bookingRepo.findOneBy({
        user: { id: req.user.id },
        course: { id: courseId },
        cancelled_at: IsNull()
      });
      if (!findBooking) {
        return next(appError(400, 'ID錯誤'));
      }

      await bookingRepo.save({
        ...findBooking,
        cancelled_at: new Date()
      });

      res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = courseController;
