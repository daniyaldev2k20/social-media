const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const timeFormula = 24 * 60 * 60 * 1000; //24 hours, 60 minutes, 60 seconds, 1000 milliseconds

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * timeFormula
    ),
    // secure: true, //cookie will be sent on encrypted connection; https
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  //remove the password from output in response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //JWT SignIn function
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Check email and password exists in req.body
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); ///select + gets field not selected by default in mongoose schema select: false

  //(await user.correctPassword(password, user.password) is passed to if statement below because if user does not exist then this code should not run
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) If everything is okay, send token to client
  //_id is used for MongoDB ids, that is why user._id instead of user.id
  createSendToken(user, 200, req, res);
});

//Cannot modify/delete cookie in our browser, this workaround creates a logout route which will send a new cookie with exact same name but with no token, this overrides the
//current cookie in the browser with same name w/o any token, effectively logging out current user
exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) Checking if token exists
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
    return next(new AppError('You are not logged in', 401));
  }

  //2) Verification of token (JWT)
  //decoded payload from this JSON Web Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exists
  //in decoded, user id via logging in is displayed, id is a property of decoded after JWT
  //verification process, currentUser checks whether the user id exists or not
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  //4) Grant access to protected routes; this next() calls the next middleware; route handler
  req.user = currentUser;
  next();
});

// //Middleware for rendered pages, no errors!
// //different from protect middleware as it will run for each and every request on rendered pages
// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   if (req.cookies.jwt) {
//     try {
//       //1) Verifies the token
//       const decoded = await promisify(jwt.verify)(req.cookies.jwt)(
//         process.env.JWT_SECRET
//       );

//       //2) Check if user still exists
//       const currentUser = await User.findById(decoded.id);
//       if (!currentUser) {
//         //if user does not exist then move to next middleware
//         return next();
//       }

//       //3) Check if user changed password after token (JWT) was issued
//       //iat stands for issued at in jwt token
//       if (currentUser.changedPasswordAfter(decoded.iat)) {
//         return next();
//       }
//       //After all checks are passed, there is a logged in user
//       return next();
//     } catch (err) {
//       //go to next middleware because there is no logged in user
//       return next();
//     }
//   }
//   //if there is no cookie then call the next middleware
//   return next();
// });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, currentPassword } = req.body;

  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Current Password is not correct', 401));
  }

  // 3) If so, update the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;

  //User.findByIdAndUpdate will not work as intended!
  await user.save();

  createSendToken(user, 201, req, res);
});
