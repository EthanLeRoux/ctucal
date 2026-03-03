const express = require('express');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser');
const ctuRoute = require('./routes/ctuRoute');

app.use(cookieParser());

app.use('/', ctuRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});