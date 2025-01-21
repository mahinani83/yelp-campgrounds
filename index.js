const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const joi = require("joi");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const campgroundRouter = require("./routers/campgroundRouter.js");
const reviewRouter = require("./routers/reviewRouter.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routers/user.js");

app.use(methodOverride("_method"));
app.use(express.json());
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const sessionConfiguration = {
  secret: "thisshouldbeabettersecrete",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfiguration));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/fakeuser", async (req, res) => {
  const user = new User({ email: "shiva@gmail", username: "shivakumar" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errMsg = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("database connected");
});

app.get("/", (req, res) => {
  res.send("<a href='campground'>click here to view all campgrounds</a>");
});
app.use("/", userRouter);
app.use("/campground", campgroundRouter);
app.use("/campground/:id/reviews", reviewRouter);
// const handlingError = (req, res, next) => {

//         if (2 > 4) {
//            next();
//          return; // If the condition passes, proceed to the next middleware
//         }
//         throw new Error('Something went wrong'); // Otherwise, throw an error
// };

// app.get('/error', handlingError, (req, res) => {
//     res.send("This route should trigger an error."); // Corrected response to avoid using undefined variable
// });

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "sorry something went wrong";
  // res.status(statusCode).send(message);
  // res.send(err.message)
  // res.send(err.stack)
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(3000, () => {
  console.log("app runnig at 3000");
});
