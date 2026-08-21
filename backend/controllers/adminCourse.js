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

const courseController = {
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
        `SELECT c.id AS course_id, COUNT(*) AS count
        FROM course_bookings cb
        JOIN courses c ON cb.course_id = c.id WHERE c.user_id = $1 AND cb.cancelled_at IS NULL
        GROUP BY c.id`,
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

module.exports = courseController;
