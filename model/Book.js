import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    oldPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    discount: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    coverImage: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    pages: {
      type: Number,
      default: 0,
      min: 0,
    },
    published: {
      type: String,
      default: "",
      trim: true,
    },
    language: {
      type: String,
      default: "",
      trim: true,
    },
    format: {
      type: String,
      default: "",
      trim: true,
    },
    isbn: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    keyTakeaways: {
      type: [String],
      default: [],
    },
    whyRead: {
      type: [String],
      default: [],
    },
    details: {
      type: [String],
      default: [],
    },
    reviewsList: {
      type: [
        {
          name: { type: String, default: "", trim: true },
          rating: { type: Number, default: 0, min: 0, max: 5 },
          text: { type: String, default: "", trim: true },
        },
      ],
      default: [],
    },
    shippingInfo: {
      type: [String],
      default: [],
    },
    shippingNote: {
      type: String,
      default: "",
      trim: true,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    students: {
      type: Number,
      default: 0,
      min: 0,
    },
    duration: {
      type: String,
      default: "",
      trim: true,
    },
    anchor: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
