// const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utit/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./route/tourRoutes');
const userRouter = require('./route/userRoutes');
const reviewRouter = require('./route/reviewRoutes');
const viewRouter = require('./route/viewRoutes');
// const reviewRoute = require('./route/reviewRoutes');

// c;

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// app.use(express.static(path.join(__dirname, 'public')));

// const app = express();
// middlewares
// console.log(process.env.NODE_ENV);
//1 global middlewear
//security http headers
// app.use(helmet());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'https://tile.openstreetmap.org',
          'https://a.tile.openstreetmap.org',
          'https://b.tile.openstreetmap.org',
          'https://c.tile.openstreetmap.org',
        ],
      },
    },
  }),
);

///dev login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit request
// const Limiter = rateLimit({
//   max: 100,
//   window: 60 * 60 * 1000,
//   message: 'too many request from this ip ,plase try again in an hour!',
// });
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ✅ Correct
  max: 100,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// body peser, reading data from the body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//data sanitazation against query injection
app.use(mongoSanitize());

//data sanitazation agaainst xss
app.use(xss());
// prevent params pollution
app.use(
  hpp({
    whiteList: [
      'duration',
      'rateingQuantity',
      'ratingsAverage',
      ' maxGroupSize',
      ' difficulty',
      ' price',
    ],
  }),
);

// serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
//   console.log('hello from the middleware 👋');
//   next();
// });
//test middlewear
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  console.log('COOKIES:', req.cookies);

  next();
});

// userRouter.route('/').get(getAllUsers).post(createUser);

// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(` can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// /// server
// const port = 3000;

// app.listen(port, () => {
//   console.log(` app running on port ${port}...`);
// });
