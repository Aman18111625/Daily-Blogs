const { Schema, model } = require("mongoose");

const commentSchema = Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "blog",
      required: true,
    },
  },
  { timestamps: true },
);

const Comment = model("comment", commentSchema);

module.exports = Comment;
