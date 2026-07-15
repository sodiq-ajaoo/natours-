// const fs = require('fs');
const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRoute = require('./../route/reviewRoutes');

// const reviewContoller = require('./../controllers/reviewContoller');

// const authController = requires('./../controllers/authCntrollers');

// const router = express.Router();

const router = express.Router();

// router.post(./signup)
// router.post('/signup', authController.signup);
// router.post('/signup', authController.signup);

// / /pot/tour/4567y/review
//get/tour/4567y/review
//get/tour/4567y/review/7655677
//pot/tour/4567y/review

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewContoller.CreateReview,
//   );

// router.param('id', tourController.checkID);

/// create acheck body middleware
// check if the body contain the name and price property
//if not send back 400 (bad request )
// add it to the post handler stack
router.use('/:tourId/reviews', reviewRoute);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTours, tourController.getAlltours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//tours-distance?distance=233,center=-40,45$unit=mi
//tours-distance/233/center/-40,45/mi
// router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAlltours) // ✅ Capital 'T'
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.checkBody,
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
