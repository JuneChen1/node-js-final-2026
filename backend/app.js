require('dotenv').config();

const express = require('express');
const cors = require('cors');
const healthcheckRouter = require('./routes/healthcheck');
const skillRouter = require('./routes/skill');
const creditPackageRouter = require('./routes/creditPackage');
const userRouter = require('./routes/user');
const adminCoachRouter = require('./routes/adminCoach');
const adminCourseRouter = require('./routes/adminCourse');
const adminRevenueRouter = require('./routes/adminRevenue');
const coachRouter = require('./routes/coach');
const courseRouter = require('./routes/course');
const uploadRouter = require('./routes/upload');
const { dataSource } = require('./db/data-source');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/healthcheck', healthcheckRouter);
app.use('/api/coaches/skill', skillRouter);
app.use('/api/credit-package', creditPackageRouter);
app.use('/api/users', userRouter);
app.use('/api/admin/coaches/courses', adminCourseRouter);
app.use('/api/admin/coaches/revenue', adminRevenueRouter);
app.use('/api/admin/coaches', adminCoachRouter);
app.use('/api/coaches', coachRouter);
app.use('/api/courses', courseRouter);
app.use('/api/upload', uploadRouter);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ status: 'failed', message: err.message });
  }

  console.error(err);
  res.status(500).json({
    status: 'failed',
    message: '伺服器發生錯誤，請稍後再試'
  });
});

dataSource
  .initialize()
  .then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('資料庫連線失敗', error);
    process.exit(1);
  });
