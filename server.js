import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import bookRoutes from "./routes/book.routes.js";
import cartRoutes from "./routes/cart.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const dbUrl = process.env.DATABASE_URL;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

const startServer = async () => {
  try {
    if (!dbUrl) {
      throw new Error("DATABASE_URL is missing in .env");
    }

    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
