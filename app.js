const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const createError = require("http-errors");
const mongoose = require("mongoose");
const path = require("path");
const indexRouter = require("./routes/index");
const catalogRouter = require("./routes/catalog");
require("dotenv").config();

//express
const app = express();

//mongodb atlas connection
async function connectToMongoDB() {
  mongoose.set("strictQuery", false);
  await mongoose.connect(process.env.ATLAS_CONN);
}
connectToMongoDB().catch((err) => console.log(err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//add routes
app.use("/", indexRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

/*
DEFAULT GENRES IN BOOKFORM 
DEFAULT BOOK IN BOOKINSTANCEFORM EJS
*/
