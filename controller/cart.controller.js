import Cart from "../model/Cart.js";
import Book from "../model/Book.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book"
    );
    return res.status(200).json({ cart: cart || { user: req.user.id, items: [] } });
  } catch (err) {
    return res.status(500).json({ message: "Fetch cart failed", error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    if (!bookId) {
      return res.status(400).json({ message: "bookId is required" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    const cart = await getOrCreateCart(req.user.id);
    const existing = cart.items.find((item) => item.book.toString() === bookId);

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({ book: bookId, quantity: qty });
    }

    await cart.save();
    const populated = await cart.populate("items.book");
    return res.status(200).json({ message: "Added to cart", cart: populated });
  } catch (err) {
    return res.status(500).json({ message: "Add to cart failed", error: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({ message: "bookId is required" });
    }

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.find((i) => i.book.toString() === bookId);

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      cart.items = cart.items.filter((i) => i.book.toString() !== bookId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populated = await cart.populate("items.book");
    return res.status(200).json({ message: "Cart updated", cart: populated });
  } catch (err) {
    return res.status(500).json({ message: "Update cart failed", error: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const cart = await getOrCreateCart(req.user.id);
    const before = cart.items.length;
    cart.items = cart.items.filter((i) => i.book.toString() !== bookId);

    if (cart.items.length === before) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    await cart.save();
    const populated = await cart.populate("items.book");
    return res.status(200).json({ message: "Item removed", cart: populated });
  } catch (err) {
    return res.status(500).json({ message: "Remove item failed", error: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    return res.status(200).json({ message: "Cart cleared", cart });
  } catch (err) {
    return res.status(500).json({ message: "Clear cart failed", error: err.message });
  }
};
