const axios = require('axios');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utit/catchAsync');
const AppError = require('../utit/appError');
const factory = require('./../controllers/handleFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email: req.user.email,
      amount: tour.price * 100,

      callback_url: `${req.protocol}://${req.get(
        'host',
      )}/api/v1/bookings/verify-payment`,

      metadata: {
        tourId: tour._id,
        userId: req.user._id,
        price: tour.price,
        tourName: tour.name,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  res.status(200).json({
    status: 'success',
    session: response.data.data,
  });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const reference = req.query.reference;

  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const payment = response.data.data;

  if (payment.status !== 'success') {
    return next(new AppError('Payment was not successful', 400));
  }

  const existingBooking = await Booking.findOne({
    paystackReference: reference,
  });

  if (!existingBooking) {
    await Booking.create({
      tour: payment.metadata.tourId,
      user: payment.metadata.userId,
      price: payment.metadata.price,
      paystackReference: payment.reference,
      paid: true,
    });
  }

  res.redirect('/my-tours');
});

exports.createBookings = factory.createOne(Booking);
exports.getBookings = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBookings = factory.updateOne(Booking);
exports.deleteBookings = factory.deleteOne(Booking);
