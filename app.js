const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const xssProtection = require('x-xss-protection');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error-handler-controller');
const userRouter = require('./routes/user');
const homeRouter = require('./routes/home');

const app = express();

const limit = rateLimit({
  max: 100, //max number of requests
  windowMs: 60 * 60 * 1000, //window period for requests
  message: 'Too many requests from this IP, please try again in an hour',
});

// Global Middlewares
app.use('/api', limit);

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(cookieParser());

// Implement CORS
app.use(cors());
//For non-simple requests; patch, delete, different headers, cookies during pre-flight phase in Browser
app.options('*', cors());

//Set security HTTP headers
app.use(helmet());

//Data sanitization in MONGODB
app.use(mongoSanitize());

//Prevent duplicate parameters
app.use(hpp());

//Compressing req.body
app.use(compression());

//Protection header against cross site scripting attacks
app.use(xssProtection());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test Middleware
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

app.use((req, res, next) => {
  console.log(req.cookies);
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/home', homeRouter);
app.use('/api/v1/users', userRouter);

//Route for all * (get, post, etc) and this middleware runs when the previous routes do
//not return anything; handling bad routes
app.use('*', (req, res, next) => {
  //if next receives an argument, Express will automatically know that it is an error
  //object and will skip other middleware and send the error obj to global error handling middleware
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

//Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
