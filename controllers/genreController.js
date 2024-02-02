const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.genre_list = asyncHandler(async (req, res, next) => {
  const genreList = await Genre.find().sort({ name: 1 }).exec();

  res.render("layout", {
    view: "genreList",
    title: "Genre List",
    data: genreList,
    error: null,
  });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    view: "genreDetail",
    title: "Genre Detail",
    data: { genre, genreBooks },
    error: null,
  });
});

exports.genre_create_get = (req, res, next) => {
  res.render("layout", {
    view: "genreForm",
    title: "Create Genre",
    data: null,
    error: null,
  });
};

exports.genre_create_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("layout", {
        view: "genreForm",
        title: "Create Genre",
        data: genre,
        error: errors.array(),
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();

      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];

exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genre === null) {
    res.redirect("/catalog/genres");
  }

  res.render("layout", {
    view: "genreDelete",
    title: "Delete Genre",
    data: { genre, genreBooks },
    error: null,
  });
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genreBooks.length > 0) {
    res.render("layout", {
      view: "genreDelete",
      title: "Delete Genre",
      data: { genre, genreBooks },
      error: null,
    });
    return;
  } else {
    await Genre.findByIdAndRemove(req.body.genreid);
    res.redirect("/catalog/genres");
  }
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  res.render("layout", {
    view: "genreForm",
    title: "Update genre",
    data: genre,
    error: null,
  });
});

exports.genre_update_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      res.render("layout", {
        view: "genreForm",
        title: "Update genre",
        data: genre,
        error: errors.array(),
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();

      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        const theGenre = await Genre.findByIdAndUpdate(
          req.params.id,
          genre,
          {}
        );
        res.redirect(theGenre.url);
      }
    }
  }),
];
