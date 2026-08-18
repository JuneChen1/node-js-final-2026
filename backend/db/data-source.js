require('dotenv').config();
const { DataSource } = require('typeorm');
const User = require('../entities/User');
const Skill = require('../entities/Skill');
const Coach = require('../entities/Coach');
const CoachLinkSkill = require('../entities/CoachLinkSkill');
const CreditPackage = require('../entities/CreditPackage');
const Course = require('../entities/Course');
const CourseBooking = require('../entities/CourseBooking');
const CreditPurchase = require('../entities/CreditPurchase');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  ssl: process.env.DB_ENABLE_SSL === 'true',
  entities: [
    User,
    Skill,
    Coach,
    CoachLinkSkill,
    CreditPackage,
    Course,
    CourseBooking,
    CreditPurchase
  ],
  migrations: ['db/migrations/*.js']
});

module.exports = { dataSource };
