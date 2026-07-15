// const express = require('express');
// const bookingController = require('../controllers/bookingController');
// const authController = require('./../controllers/authController');

// const router = express.Router();

// router.get(
//   '/checkout-session/:tourID',
//   authController.protect,
//   bookingController.getCheckoutSession,
// );

// // router.use(authController.protect);

// module.exports = router;

const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get(
  '/checkout-session/:tourId',

  bookingController.getCheckoutSession,
);

router.get('/verify-payment', bookingController.verifyPayment);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBookings);

router
  .route('/:id')
  .get(bookingController.getBookings)
  .patch(bookingController.updateBookings)
  .delete(bookingController.deleteBookings);

module.exports = router;
