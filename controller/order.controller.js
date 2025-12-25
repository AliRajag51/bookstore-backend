import Order from "../model/Order.js";
import Book from "../model/Book.js";
import nodemailer from "nodemailer";

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing in .env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const normalizeItems = (items = []) =>
  items
    .map((item) => ({
      bookId: item.bookId || item.id,
      quantity: Number(item.quantity) || 0,
    }))
    .filter((item) => item.bookId && item.quantity > 0);

export const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, address, email, fullName } = req.body;
    const cleanItems = normalizeItems(items);

    if (!cleanItems.length) {
      return res.status(400).json({ message: "Order items required" });
    }
    if (!address || !email || !fullName) {
      return res.status(400).json({ message: "Name, email, and address required" });
    }

    const bookIds = cleanItems.map((item) => item.bookId);
    const books = await Book.find({ _id: { $in: bookIds } });
    if (books.length !== bookIds.length) {
      return res.status(400).json({ message: "One or more books not found" });
    }

    const itemsSnapshot = cleanItems.map((item) => {
      const book = books.find((b) => b._id.toString() === item.bookId);
      return {
        book: book._id,
        title: book.title,
        price: Number(book.price) || 0,
        quantity: item.quantity,
      };
    });

    const totalAmount = itemsSnapshot.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user.id,
      items: itemsSnapshot,
      totalAmount,
      paymentMethod: paymentMethod || "credit-card",
      shippingAddress: address,
      contactEmail: email,
      contactName: fullName,
    });

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Book Store" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Order Confirmation",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;">
          <h2>Thanks for your order, ${fullName}!</h2>
          <p>Your order has been placed successfully.</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
          <p><strong>Shipping Address:</strong> ${address}</p>
          <h3>Items</h3>
          <ul>
            ${itemsSnapshot
              .map(
                (item) =>
                  `<li>${item.title} - $${item.price.toFixed(2)} x ${item.quantity}</li>`
              )
              .join("")}
          </ul>
          <p>We will notify you when your order ships.</p>
        </div>
      `,
    });

    return res.status(201).json({
      message: "Order placed",
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Create order failed", error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (err) {
    return res.status(500).json({ message: "Fetch orders failed", error: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({ message: "Fetch order failed", error: err.message });
  }
};
