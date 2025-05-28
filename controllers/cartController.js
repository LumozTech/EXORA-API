import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get cart for a user
const getCart = async (req, res) => {
  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'User email not found in token' });
    }

    let cart = await Cart.findOne({ userEmail });
    
    if (!cart) {
      cart = new Cart({ userEmail, items: [] });
      await cart.save();
    }
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'User email not found in token' });
    }

    const { productId, quantity, size } = req.body;
    console.log('Adding to cart:', { userEmail, productId, quantity, size });

    // Validate product exists and has enough stock
    const product = await Product.findOne({ productId: productId });
    console.log('Found product:', product);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userEmail });
    if (!cart) {
      cart = new Cart({ 
        userEmail,
        items: [],
        totalAmount: 0
      });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(item => 
      item.productId === productId && item.size === size
    );

    if (existingItem) {
      // Update quantity if product exists
      existingItem.quantity += quantity;
    } else {
      // Add new item if product doesn't exist
      // Make sure we have all required fields from the product
      if (!product.productName || !product.price || !product.images?.[0]) {
        return res.status(400).json({ 
          message: 'Invalid product data',
          details: {
            hasName: !!product.productName,
            hasPrice: !!product.price,
            hasImage: !!product.images?.[0]
          }
        });
      }

      cart.items.push({
        productId: product.productId,
        productName: product.productName,
        price: product.price,
        quantity: quantity,
        image: product.images[0],
        size: size
      });
    }

    // Calculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Save cart
    const savedCart = await cart.save();
    console.log('Saved cart:', savedCart);
    res.status(200).json(savedCart);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ 
      message: 'Error adding item to cart', 
      error: error.message,
      details: error.errors // Include mongoose validation errors if any
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'User email not found in token' });
    }

    const { productId, quantity, size } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userEmail });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => 
      item.productId === productId && item.size === size
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Validate stock
    const product = await Product.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    item.quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'User email not found in token' });
    }

    const { productId, size } = req.params;

    const cart = await Cart.findOne({ userEmail });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      !(item.productId === productId && item.size === size)
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'User email not found in token' });
    }

    const cart = await Cart.findOne({ userEmail });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 