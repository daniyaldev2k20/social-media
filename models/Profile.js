const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      default: 'Bio',
    },
    education: [
      {
        school: {
          type: String,
        },
        university: {
          type: String,
        },
        degree: {
          type: String,
        },
      },
    ],
    social: {
      twitter: {
        type: String,
        default: 'twitter.com',
      },
      youtube: {
        type: String,
        default: 'youtube.com',
      },
      linkedin: {
        type: String,
        default: 'linkedin.com',
      },
      instagram: {
        type: String,
        default: 'instagram',
      },
    },
    status: {
      type: String,
      default: 'single',
    },
    city: {
      type: String,
      required: true,
    },
  }
  //   {
  //     //Each time the data is outputted as JSON/Object then virtuals will be true
  //     toJSON: { virtuals: true },
  //     toObject: { virtuals: true },
  //   }
);

const Profile = mongoose.model('profiles', userProfileSchema);

module.exports = Profile;
