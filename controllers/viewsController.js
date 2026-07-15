const Tour = require('../models/tourModel');
const User = require('../models/usermodel');
const AppError = require('../utit/appError');
const catchAsync = require('../utit/catchAsync');
const Booking = require('../models/bookingModel');
exports.getOverview = catchAsync(async (req, res) => {
  //1) get tour data from collection
  const tours = await Tour.find();

  //2 build template
  //3 render thta template using the tour dat from step one
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1 get the data for the require toue(reviews  guide)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: ' review rating user',
  });

  if (!tour) {
    return next(new AppError('there is no tour with that name', 400));
  }
  //build the template
  //3 render template using he data

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'login into your  account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your  account ',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'your  account ',
    user: updatedUser,
  });
});

// exports.getMyTours = catchAsync(async (req, res, next) => {
//   res.status(200).render('overview', {
//     title: 'My Tours',
//     bookings,
//   });
//   console.log(bookings);
// });

exports.getMyTours = catchAsync(async (req, res, next) => {
  console.log('getMyTours called');

  const bookings = await Booking.find({
    user: req.user.id,
  }).populate('tour');

  console.log(bookings);

  res.status(200).render('myTours', {
    title: 'My Tours',
    bookings,
  });
});

// exports.getMyTours = catchAsync(async (req, res, next) => {
//   const bookings = await Booking.find({
//     user: req.user.id,
//   }).populate('tour');

//   console.log(bookings);

//   res.status(200).render('myTours', {
//     title: 'My Tours',
//     bookings,
//   });
// });
