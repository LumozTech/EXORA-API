import mongoose, { Schema } from "mongoose";

const reviewSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    require: true,
    default: Date.now,
  },
  hidden: {
    type: Boolean,
    default: true, // Default is hidden (pending approval)
  },
});

const Review = mongoose.model("reviews", reviewSchema);
export default Review;
