const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).type('text/plain').send('OK');
});

module.exports = router;
