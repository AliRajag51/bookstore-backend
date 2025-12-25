import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const dbUrl = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json());

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
