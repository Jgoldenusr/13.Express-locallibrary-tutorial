const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.book_instance_list = asyncHandler(async (req, res, next) => {
  const bookInstanceList = await BookInstance.find().populate("book").exec();

  res.render("layout", {
    view: "bookInstanceList",
    title: "Book Instance List",
    data: bookInstanceList,
    error: null,
  });
});

exports.book_instance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    view: "bookInstanceDetail",
    title: `Copy: ${bookInstance.book.title}`,
    data: bookInstance,
    error: null,
  });
});

exports.book_instance_create_get = asyncHandler(async (req, res, next) => {
  const books = await Book.find({}, "title").exec();

  res.render("layout", {
    view: "bookInstanceForm",
    title: "Create BookInstance",
    data: { books },
    error: null,
  });
});

exports.book_instance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 5 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      const books = await Book.find({}, "title").exec();
      res.render("layout", {
        view: "bookInstanceForm",
        title: "Create BookInstance",
        data: {
          books,
          bookInstance: bookInstance,
          selectedBookId: bookInstance.book._id,
        },
        error: errors.array(),
      });
      return;
    } else {
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

exports.book_instance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).exec();

  res.render("layout", {
    view: "bookInstanceDelete",
    title: "Delete book instance",
    data: bookInstance,
    error: null,
  });
});

exports.book_instance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndRemove(req.body.instanceid);
  res.redirect("/catalog/bookinstances");
});

exports.book_instance_update_get = asyncHandler(async (req, res, next) => {
  const [books, bookInstance] = await Promise.all([
    Book.find({}, "title").exec(),
    BookInstance.findById(req.params.id).populate("book").exec(),
  ]);

  res.render("layout", {
    view: "bookInstanceForm",
    title: `Update Copy: ${bookInstance.book.title}`,
    data: {
      books,
      bookInstance: bookInstance,
      selectedBookId: bookInstance.book._id,
    },
    error: null,
  });
});

exports.book_instance_update_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 5 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const books = await Book.find({}, "title").exec();

      res.render("layout", {
        view: "bookInstanceForm",
        title: `Update Copy: ${bookInstance.book.title}`,
        data: {
          books,
          bookInstance: bookInstance,
          selectedBookId: bookInstance.book._id,
        },
        error: errors.array(),
      });

      return;
    } else {
      const theInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {}
      );
      res.redirect(theInstance.url);
    }
  }),
];
