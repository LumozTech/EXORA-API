import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { isAdmin, isCustomer } from "./UserController.js";

export async function createOrder(req, res) {
  if (!isCustomer(req)) {
    return res.status(401).json({
      message: "Please login as customer to create orders",
    });
  }

  try {
    // Generate new order ID
    const lastestOrder = await Order.find().sort({ date: -1 }).limit(1);
    let orderId = lastestOrder.length === 0 
      ? "CBC0001" 
      : "CBC" + (parseInt(lastestOrder[0].orderId.replace("CBC", "")) + 1).toString().padStart(4, "0");

    const orderData = req.body;
    const newProductArray = [];
    let totalAmount = 0;

    // Validate and process each ordered item
    for (const item of orderData.orderedItems) {
      const product = await Product.findOne({
        productId: item.productId
      });

      if (!product) {
        return res.status(404).json({
          message: `Product with id ${item.productId} not found`
        });
      }

      // Check stock availability
      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.productName}`
        });
      }

      // Update product stock
      await Product.updateOne(
        { productId: item.productId },
        { $inc: { stock: -item.qty, soldCount: item.qty } }
      );

      // Calculate item total and add to order items
      const itemTotal = product.lastPrice * item.qty;
      totalAmount += itemTotal;

      newProductArray.push({
        productId: item.productId,
        name: product.productName,
        price: product.lastPrice,
        quantity: item.qty,
        image: product.images[0],
        size: item.size || 'M'
      });
    }

    // Create the order
    const order = new Order({
      orderId,
      email: req.user.email,
      name: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      orderedItems: newProductArray,
      totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
      status: 'Preparing'
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      message: error.message || "Error creating order"
    });
  }
}

export async function getOrders(req, res) {
  try {
    if (isCustomer(req)) {
      const orders = await Order.find({ email: req.user.email }).sort({ date: -1 });
      return res.json(orders);
    } 
    
    if (isAdmin(req)) {
      const orders = await Order.find({}).sort({ date: -1 });
      return res.json(orders);
    }

    return res.status(401).json({
      message: "Please login to view orders"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getQuote(req, res) {
  try {
    if (!isCustomer(req)) {
      return res.status(401).json({
        message: "Please login to get quote"
      });
    }

    const orderData = req.body;
    const orderedItems = [];
    let total = 0;
    let labelTotal = 0;

    // Calculate quote for each item
    for (const item of orderData.orderedItems) {
      const product = await Product.findOne({
        productId: item.productId
      });

      if (!product) {
        return res.status(404).json({
          message: `Product with id ${item.productId} not found`
        });
      }

      // Check stock availability
      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.productName}`
        });
      }

      labelTotal += product.price * item.qty;
      total += product.lastPrice * item.qty;

      orderedItems.push({
        productId: item.productId,
        name: product.productName,
        price: product.lastPrice,
        labelPrice: product.price,
        quantity: item.qty,
        image: product.images[0]
      });
    }

    res.json({
      orderedItems,
      total,
      labelTotal,
      savings: labelTotal - total
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

// Update order status (admin only)
export async function updateOrderStatus(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(401).json({
        message: "Only administrators can update order status"
      });
    }

    const { orderId, status } = req.body;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}
