const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const {
  isValidString,
  isValidEmail,
  isValidPassword
} = require('../utils/validUtils');

const userController = {
  async signUp(req, res, next) {
    const { name, email, password } = req.body;
    if (
      !isValidString(name) ||
      !isValidEmail(email) ||
      !isValidPassword(password)
    ) {
      return next(appError(400, '欄位未填寫正確'));
    }

    try {
      const userRepo = dataSource.getRepository('User');
      const existing = await userRepo.findOneBy({
        email: email.trim().toLowerCase()
      });
      if (existing) {
        return next(appError(409, 'Email 已被使用'));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userRepo.save({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'USER'
      });

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async login(req, res, next) {
    const { email, password } = req.body;
    if (!isValidEmail(email) || !isValidPassword(password)) {
      return next(appError(400, '欄位未填寫正確'));
    }
    try {
      const userRepo = dataSource.getRepository('User');
      const user = await userRepo.findOneBy({
        email: email.trim().toLowerCase()
      });
      if (!user) {
        return next(appError(400, '使用者不存在或密碼輸入錯誤'));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(appError(400, '使用者不存在或密碼輸入錯誤'));
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_DAY }
      );

      res.status(201).json({
        status: 'success',
        data: {
          token,
          user: {
            name: user.name
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async getProfile(req, res, next) {
    const user = req.user;
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          name: user.name,
          email: user.email
        }
      }
    });
  },
  async updateProfileName(req, res, next) {
    try {
      const { name } = req.body;
      if (!isValidString(name)) {
        return next(appError(400, '欄位未填寫正確'));
      }

      const userRepo = dataSource.getRepository('User');
      const user = await userRepo.findOneBy({ id: req.user.id });
      if (user.name === name) {
        return next(appError(400, '使用者名稱未變更'));
      }

      const newUser = await userRepo.save({
        ...user,
        name: name
      });
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            name: newUser.name
          }
        }
      });
    } catch (error) {
      next(appError(400, '更新使用者資料失敗'));
    }
  },
  async updatePassword(req, res, next) {
    try {
      const { password, new_password, confirm_new_password } = req.body;
      if (
        !isValidString(password) ||
        !isValidString(new_password) ||
        !isValidString(confirm_new_password)
      ) {
        return next(appError(400, '欄位未填寫正確'));
      }

      if (
        !isValidPassword(password) ||
        !isValidPassword(new_password) ||
        !isValidPassword(confirm_new_password)
      ) {
        return next(
          appError(
            400,
            '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
          )
        );
      }

      if (password === new_password) {
        return next(appError(400, '新密碼不能與舊密碼相同'));
      }

      if (new_password !== confirm_new_password) {
        return next(appError(400, '新密碼與驗證新密碼不一致'));
      }

      const userRepo = dataSource.getRepository('User');
      const user = await userRepo.findOneBy({ id: req.user.id });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(appError(400, '密碼輸入錯誤'));
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await userRepo.save({
        ...user,
        password: hashedPassword
      });

      res.status(200).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  },
  async getCreditPackage(req, res, next) {
    try {
      const purchaseRepo = dataSource.getRepository('CreditPurchase');
      const result = await purchaseRepo.find({
        where: { user: { id: req.user.id } },
        relations: { creditPackage: true },
        order: { created_at: 'DESC' }
      });

      const data = result.map((item) => {
        return {
          name: item.creditPackage.name,
          purchased_credits: Number(item.purchased_credits),
          price_paid: Number(item.price_paid),
          purchase_at: item.created_at
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
  async getCourses(req, res, next) {
    try {
      const purchaseRepo = dataSource.getRepository('CreditPurchase');
      const bookingRepo = dataSource.getRepository('CourseBooking');
      const allPurchases = await purchaseRepo.find({
        where: { user: { id: req.user.id } }
      });
      const totalCredits = allPurchases.reduce(
        (acc, cur) => cur.purchased_credits + acc,
        0
      );

      const allBookings = await bookingRepo.find({
        where: { user: { id: req.user.id } },
        relations: { course: { user: true } },
        order: { course: { start_at: 'ASC' } }
      });
      const creditUsage = allBookings.filter((b) => !b.cancelled_at).length;
      const creditRemain = totalCredits - creditUsage;

      const courseBooking = allBookings.map((b) => {
        return {
          course_id: b.course.id,
          name: b.course.name,
          start_at: b.course.start_at,
          end_at: b.course.end_at,
          meeting_url: b.course.meeting_url,
          coach_name: b.course.user.name,
          cancelled_at: b.cancelled_at
        };
      });

      res.status(200).json({
        status: 'success',
        data: {
          credit_remain: creditRemain,
          credit_usage: creditUsage,
          course_booking: courseBooking
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
