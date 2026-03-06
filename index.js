const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const ctuRoute = require('./routes/ctuRoute');
const PORT = process.env.PORT || 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

require('dotenv').config();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CTU Calendar API",
      version: "1.0.0",
      description: "API that scrapes CTU assessments and generates calendar events"
    }
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.use(cookieParser());

app.use('/', ctuRoute);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});