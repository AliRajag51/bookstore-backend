import dotenv from "dotenv";
import mongoose from "mongoose";
import { pathToFileURL } from "url";
import Book from "../model/Book.js";

dotenv.config();

const dataPath = "D:\\Mern Projects\\frontend\\src\\data\\books.js";

const mapBook = (book) => {
  const { id, ...rest } = book;
  return {
    ...rest,
    slug: id,
  };
};

const seed = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env");
  }

  await mongoose.connect(process.env.DATABASE_URL);
  const moduleUrl = pathToFileURL(dataPath).href;
  const { books } = await import(moduleUrl);

  for (const book of books) {
    const payload = mapBook(book);
    await Book.updateOne({ slug: payload.slug }, { $set: payload }, { upsert: true });
  }

  console.log(`Seeded ${books.length} books`);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
