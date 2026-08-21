const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const availableMonth = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
];

const revenueController = {
  async getRevenue(req, res, next) {
    const { month } = req.query;
    if (!availableMonth.includes(month)) {
      return next(appError(400, '欄位未填寫正確'));
    }
    try {
      const year = new Date().getFullYear();
      const setMonth = availableMonth.findIndex((m) => m === month) + 1;

      const bookingRepo = dataSource.getRepository('CourseBooking');
      const findBookings = await bookingRepo.query(
        `
      SELECT cb.user_id
      FROM course_bookings cb
      JOIN courses c ON c.id = cb.course_id
      WHERE c.user_id = $1
        AND cb.cancelled_at IS NULL
        AND EXTRACT(YEAR FROM cb.created_at) = $2
        AND EXTRACT(MONTH FROM cb.created_at) = $3
      `,
        [req.user.id, year, setMonth]
      );
      const count = findBookings.length;

      if (count === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            total: {
              revenue: 0,
              participants: 0,
              course_count: 0
            }
          }
        });
      }

      const packageRepo = dataSource.getRepository('CreditPackage');
      const findPackages = await packageRepo.find();
      const totalPrice = findPackages.reduce((acc, cur) => cur.price + acc, 0);
      const totalCredit = findPackages.reduce(
        (acc, cur) => cur.credit_amount + acc,
        0
      );
      const averagePrice = totalPrice / totalCredit;
      const participants = [...new Set(findBookings.map((b) => b.user_id))]
        .length;

      res.status(200).json({
        status: 'success',
        data: {
          total: {
            revenue: Math.floor(count * averagePrice),
            participants,
            course_count: count
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = revenueController;
