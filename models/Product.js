import mongoose, { Schema } from "mongoose";

const productSchema = mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  altNames: [
    {
      type: String,
    },
  ],
  images: [
    {
      type: String,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  lastPrice: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ["kids", "men", "women"],
  },
  isBestSelling: {
    type: Boolean,
    default: false,
  },
  isTopRated: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "inactive"],
    default: "active",
  },
});

const Product = mongoose.model("products", productSchema);
export default Product;
