const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter your name'],
      trim: true,
      validate: [validator.isAlpha, 'Provide a valid name'],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'Please enter your email address'],
      trim: true,
      validate: [validator.isEmail, 'Provide a valid email'],
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'A user must have a password'],
      maxlength: 15,
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Confirm your password'],
      validate: {
        //Only works on create and save
        validator: function (el) {
          return el === this.password;
        },
        message: 'Password is not the same',
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Friends',
        unique: true,
      },
    ],
  },
  {
    //Each time the data is outputted as JSON/Object then virtuals will be true
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtually populating User Posts
userSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'user',
  localField: '_id',
});

//Mongoose Middleware (Document)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  //For saving 1 second in past
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//query middleware finds the document
//with active set to true, before queries like find is used
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//Schema instance methods
userSchema.methods.correctPassword = async function (candidate, user) {
  return await bcrypt.compare(candidate, user);
};

//JWTTimestamp means the time when JWT token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 100,
      10
    );
    //Password changed after token was issued 100 < 200 for example
    return JWTTimeStamp < changedTimeStamp;
  }
  //FALSE means not changed, user password has not been changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //this token is created to grant user a temp token so that user can use to create real password
  //only this user will have access to this password
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //10 is minutes, 60 is seconds, and 1000 is for milliseconds
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
