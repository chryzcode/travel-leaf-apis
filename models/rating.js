import mongoose from "mongoose";

const ratingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    numberOfRating: {
      type: Number,
      required: [true, "Please provide number of rating between 1 to 5"],
      min: 1,
      max: 5,
    },

    listingId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Rating = mongoose.model("Rating", ratingSchema);

export { Rating };
