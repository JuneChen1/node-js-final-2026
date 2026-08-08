require('dotenv').config();

const express = require('express');
const cors = require('cors');
const healthcheckRouter = require('./routes/healthcheck');

const app = express();
app.use(cors());

app.use('/healthcheck', healthcheckRouter);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: '伺服器發生錯誤' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`伺服器啟動中：http://localhost:${PORT}`));
