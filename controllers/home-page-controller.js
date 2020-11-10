const catchAsync = require('../utils/catchAsync');

exports.getHomePage = catchAsync(async (req, res) => {
  res.status(200).render('homePage', {
    title: 'Social Media Backend',
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account',
  });
};

exports.getChatFeature = catchAsync(async (req, res) => {
  res.status(200).render('chat', {
    title: 'Chat Feature',
  });
});
