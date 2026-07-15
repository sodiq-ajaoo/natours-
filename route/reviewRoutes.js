const express = require('express');
const reviewController = require('../controllers/reviewContoller');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

//post /tour/44677/reviews
//post

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.CreateReview,
  );

// router
//   .route('/:id')
//   .get(reviewController.getReview)
//   .patch(authController.reviewController.updateReview)
//   .delete(reviewController.deleteReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
