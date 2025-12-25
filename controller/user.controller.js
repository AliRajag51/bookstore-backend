import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../model/User.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};


export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, acceptedTerms } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ message: "First name, last name, email, and password required" });
    }
    if (acceptedTerms !== true) {
      return res.status(400).json({ message: "Terms must be accepted" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "This email is already registered. Please log in." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is missing in .env" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      acceptedTerms: true,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userPayload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      message: "User registered",
      user: userPayload,
      token,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(404)
        .json({ message: "This email is not registered. Please sign up." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Book Store" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;">
          <h2>Password reset</h2>
          <p>We received a request to reset your password.</p>
          <p>Click the link below to reset it. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}">Reset your password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Reset link sent. Please check your email.",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Forgot password failed", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is missing in .env" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    const userPayload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      user: userPayload,
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const logoutUser = async (req, res) => {
  const clearTokenOptions = {
    httpOnly: true,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
    path: "/",
  };

  res.clearCookie("token", clearTokenOptions);
  return res.status(200).json({ message: "Logged out" });
};

export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is missing in .env" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id firstName lastName email role"
    );

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    const clearTokenOptions = {
      httpOnly: true,
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      path: "/",
    };
    res.clearCookie("token", clearTokenOptions);
    return res.status(401).json({ message: "Not authenticated" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful. Please log in." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Reset password failed", error: err.message });
  }
};
