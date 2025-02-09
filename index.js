if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

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
const multer = require("multer");
const upload = multer({dest:'uploads/'})
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

app.use(methodOverride("_method"));
app.use(express.json());
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
)
app.use(mongoSanitize());  

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
  mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
})

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})


const sessionConfiguration ={
  store,
  name:'session',
  secret,
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

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.tiles.mapbox.com/",
  // "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
  "https://code.jquery.com"
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.mapbox.com/",
  // "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
  // "https://api.mapbox.com/",
  // "https://a.tiles.mapbox.com/",
  // "https://b.tiles.mapbox.com/",
  // "https://events.mapbox.com/",
  "https://api.maptiler.com/", // add this
];


const imgSrc = [
  // all your other existing code
  
  // add this:
  "https://api.maptiler.com/",
]

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnysz92qi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



  
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



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
  res.render("home.ejs");
});
app.use("/", userRouter);
app.use("/campgrounds", campgroundRouter);
app.use("/campgrounds/:id/reviews", reviewRouter);
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
