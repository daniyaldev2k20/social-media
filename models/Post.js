const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types,
      ref: 'User',
      required: [true, 'Post must belong to a user'],
      unique: true,
    },
    post: {
      type: String,
      required: true,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types,
          ref: 'User',
        },
        date: {
          type: Date,
          default: Date.now(),
        },
        comment: {
          type: String,
        },
        commentLikes: [
          {
            user: {
              type: mongoose.Schema.Types,
              ref: 'User',
            },
          },
        ],
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types,
          ref: 'User',
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now(),
    },
  }
  //   {
  //     //Each time the data is outputted as JSON/Object then virtuals will be true
  //     toJSON: { virtuals: true },
  //     toObject: { virtuals: true },
  //   }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
