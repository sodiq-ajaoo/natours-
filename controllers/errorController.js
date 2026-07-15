const AppError = require('../utit/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('invalid token please log in again', 401);

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\.|(?!\1).)*\1/)[0];
  console.log(value);
  const message = `Duplicate field value ${value} Please use another value!`;
  return new AppError(message, 400);
};

const handleValidtionErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = ` invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJwtExpiredError = () =>
  new AppError('Your token as expired please login again', 401);

const sendErrorDev = (err, req, res) => {
  //api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // rendeed website
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

// const sendErrorProd = (err, req, res) => {
//   //api
//   if (req.originalUrl.startsWith('/api')) {
//     if (err.isOperational) {
//       // operational, trusted error ; send the messsage to the client

//       return res.status(err.statusCode).render('error', {
//         title: 'Something went wrong',
//         msg: err.message,
//       });

//       // programming  or other unknow error : dont want to leak error details to the client
//     }
//     // 1() log eror
//     console.error('ERROR ', err);

//     //2( ) send a generic message
//     return res.status(500).json({
//       status: 'error',
//       message: 'Something went very wrong!',
//     });
//   }
// };
// //render website
// if (err.isOperational) {
//   // operational, trusted error ; send the messsage to the client

//   res.status(err.statusCode).render('error', {
//     title: 'Something went wrong',
//     msg: err.message,
//   });

//   // programming  or other unknow error : dont want to leak error details to the client
// } else {
//   // 1() log eror
//   console.error('ERROR ', err);

//   //2( ) send a generic message
//   res.status(err.statusCode).render('error', {
//     title: 'Something went wrong',
//     msg: 'please try again later',
//   });
// }

const sendErrorProd = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error('ERROR 💥', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // Rendered website errors
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }

  console.error('ERROR 💥', err);

  return res.status(500).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later.',
  });
};

// module.exports = (err, req, res, next) => {
//   // console.log(err.stack);

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   if (process.env.NODE_ENV === 'development') {
//     sendErrorDev(err, req, res);
//   } else if (process.env.NODE_ENV === 'production') {
//     // let error = { ...er;
//     let error = err;
//     if (error.name === 'CastError') error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(err);
//     if (error.name === 'ValidationError') error = handleValidtionErrorDB(err);

//     if (error.name === 'jsonWebTokenError') error = handleJWTError(error);
//     if (error.name === 'TokeExpiredError') error = handleJwtExpiredError();
//     sendErrorProd(error, req, res);
//   }
// };
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidtionErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpiredError();

    sendErrorProd(error, req, res);
  }
};
