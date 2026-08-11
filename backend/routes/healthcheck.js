const express = require('express');
const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    await dataSource.query('SELECT 1');
    res.status(200).type('text/plain').send('OK');
  } catch (error) {
    console.error(error);
    res.status(503).type('text/plain').send('Service Unavailable');
  }
});

module.exports = router;
