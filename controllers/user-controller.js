const sharp = require('sharp');

const User = require('../models/User');
const Profile = require('../models/Profile');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const upload = require('../utils/multerSettings');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user exists with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  //Check if user exists
  if (!user) {
    return next(new AppError('No user exists with that ID', 404));
  }

  //Check if req.body contains name and email
  if (!req.body.name || !req.body.email) {
    next(new AppError('This route is for updating user name and email', 400));
  }

  const filteredBody = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// User profile section
exports.createUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User does not exists by that ID', 404));
  }

  const { bio, status, city } = req.body;
  const { school, university, degree } = req.body.education;
  const { twitter, youtube, linkedin, instagram } = req.body.social;

  const profile = await Profile.create({
    user,
    bio,
    twitter,
    youtube,
    linkedin,
    instagram,
    status,
    city,
  });

  if (school || university || degree) {
    const educationObj = { school, university, degree };
    profile.education.unshift(educationObj);
  }

  await profile.save();

  res.status(201).json({
    status: 'success',
    data: {
      profile,
    },
  });
});

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User Profile does not exists', 404));
  }

  const userProfile = await User.findById(req.params.id).populate('profile');

  res.status(200).json({
    status: 'success',
    data: {
      userProfile,
    },
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const userProfile = await Profile.findById(req.params.id);

  if (!userProfile) {
    return next(new AppError('No user profile exists', 404));
  }

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword',
        400
      )
    );
  }

  // 2) Update user profile
  //filteredBody only contains the relevant data to be updated like name or email
  const filteredBody = filterObj(
    req.body,
    'bio',
    'education',
    'social',
    'status',
    'city'
  );

  //Check if request body contains file for updating profile avatar
  if (req.file) {
    filteredBody.avatar = req.file.filename;
  }

  const updatedUserProfile = await Profile.findByIdAndUpdate(
    userProfile.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      userProfile: updatedUserProfile,
    },
  });
});

exports.deactivateProfile = catchAsync(async (req, res, next) => {
  //this updates the user id and its active schema prop to false
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Upload User Photo section
exports.uploadUserPhoto = upload.single('avatar');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
});
