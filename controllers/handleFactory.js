const AppError = require('../utit/appError');
const catchAsync = require('../utit/catchAsync');
const APiFeature = require('./../utit/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // const doc = await Model.findById(req.params.id).populate('reviews');

    if (!doc) {
      return next(new AppError('No document find with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });

    // const tour = tours.find((el) => el.id === id);
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // to allow forneted get review on tour hack
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //// execute the query
    const features = new APiFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .pagination();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // send respond
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
