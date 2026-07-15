/// reviw/ rating / createdat /  ref to tour// ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
// const { Schema } = require('./usermodel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'give use a review'],
      // unique: true,
      // trim: true,
      // maxLength: [40, 'A tour name most have less or equal than 40 characters'],
      // minLength: [10, 'A tour name most have less or equal than 40 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      // default: 4.5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must Belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must Belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });
  //   next();
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this point to current review

  this.constructor.calcAverageRatings(this.tour);
  // next()
});

// Tour.findByIdAndUpdate;
// Tour.findByIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  //await this.findone does not work here has already excuted
  this.r.constructor.calcAverageRatings(this.r.tour);
});

// reviewSchema;
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

/// post/tour/234fffc/reviews
/// get/tour/234fffc/reviews
/// get/tour/234fffc/reviews/4657689686
