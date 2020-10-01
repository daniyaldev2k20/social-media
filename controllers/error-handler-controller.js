const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field values: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //Object.values loop over object property values and return an array with said properties
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token, please login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please login again', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: do not leak error details to client
    //1) Log error
    // console.log('ERROR ', err);

    //2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something is not right',
    });
  }
};

//For global error handling Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //for development stage, use this response message
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    //for production stage, use this response message
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    error.message = err.message;

    //for invalid path route: caused by MongoDB
    if (error.name === 'CastError') {
      //transforming local scoped error into operational error via our AppError.js class
      error = handleCastErrorDB(error);
    }

    //for duplicate fields in MongoDB
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    //for MongoDB schema validation error created my Mongoose
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    //for JWT verification error if token is not same
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    //for JWT token expiration, if token is expired past due time
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }

  next();
};
