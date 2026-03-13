require('dotenv').config();

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const ctuRoute = require('./routes/ctuRoute');
const PORT = process.env.PORT || 3000;



app.use(cookieParser());

app.use('/', ctuRoute);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});