import Book from "../model/Book.js";

export const createBook = async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    const book = await Book.create(req.body);
    return res.status(201).json({ message: "Book created", book });
  } catch (err) {
    return res.status(500).json({ message: "Create book failed", error: err.message });
  }
};

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ books });
  } catch (err) {
    return res.status(500).json({ message: "Fetch books failed", error: err.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json({ book });
  } catch (err) {
    return res.status(500).json({ message: "Fetch book failed", error: err.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json({ message: "Book updated", book: updated });
  } catch (err) {
    return res.status(500).json({ message: "Update book failed", error: err.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json({ message: "Book deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Delete book failed", error: err.message });
  }
};
