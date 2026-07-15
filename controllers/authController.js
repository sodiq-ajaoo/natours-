const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/usermodel');
const catchAsync = require('./../utit/catchAsync');
const AppError = require('./../utit/appError');
const Email = require('./../utit/email.js');

// Create JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookiesOptions = res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true,
    httpOnly: true,
    secure: req.secure || req.header('x-forword-proto') === 'https',
  });

  /// remove te password from te cookies signup
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// SIGN UP
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, req, res);
});

// exports.logout = (req, res) => {
//   res.cookie('jwt', 'loggedout', {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status().json({ status: 'success' });
// };

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    // console.log(token);

    return next(new AppError('You are not logged in! Please log in.', 401));
  }

  //2 verification token
  // console.log('Token:', token);
  // console.log('JWT_SECRET:', process.env.JWT_SECRET);
  // const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // console.log(decoded);
  // console.log(decoded);

  //3 check if user still exists
  const CurrentUser = await User.findById(decoded.id);
  if (!CurrentUser) {
    return next(
      new AppError('the user belong to ths token does no longer exist '),
      401,
    );
  }

  // check if user change pasword after the token was issued
  if (CurrentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently change password please log in again ', 401),
    );
  }

  //grant access to protected route
  req.user = CurrentUser;
  res.locals.user = CurrentUser;
  next();
});

//////////// only for reander pages no errors
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1 verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // console.log(decoded);
      // console.log(decoded);

      //3 check if user still exists
      const CurrentUser = await User.findById(decoded.id);
      if (!CurrentUser) {
        return next();
      }

      // check if user change pasword after the token was issued
      if (CurrentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //there is a login user
      res.locals.user = CurrentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

/////////

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //role [admin lead-guide ].role=user
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not premission to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this email', 404));
  }
  //generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  /// 3 send it back as an email
  //   const resetURL = ` ${req.protocol}://${req.get('host') / api / v1 / users /resetPassword/${resetToken}`;

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    console.log(err);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'there was an error sending the email . try again later',
        500,
      ),
    );
  }

  // } catch (err) {
  //   ((user.passwordResetToken = undefined),
  //     (user.passwordResetExpires = undefined),
  //     await user.save({ validateBeforeSave: false }));

  //   return next(
  //     new AppError(
  //       'there was an error sending the email . try again later',
  //       500,
  //     ),
  //   );
  // }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2if token has not expired is there is a  user set the new password
  if (!user) {
    return next(new AppError('Token invalid or has expired expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //update chamgepass property for the user

  ///log theuser in send jwt
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 get the use from the collection
  const user = await User.findById(req.user.id).select('+password');
  //2 check if the posted currnt passowrd is corrcet
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('your current password is wrong', 401));
  }
  //3 if so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4 log user in send jwt
  createSendToken(user, 200, req, res);
});
