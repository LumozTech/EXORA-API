import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  orderedItems: [
    {
      productId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      size: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL']
      }
    },
  ],
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bank', 'cod', 'stripe'],
    default: 'cod'
  },
  paymentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    required: true,
    enum: ['Preparing', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: "Preparing",
  },
  notes: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  }
});

const Order = mongoose.model("orders", orderSchema);
export default Order;
