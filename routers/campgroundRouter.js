const express = require("express");
const router = express.Router();
const CatchError = require("../utils/CatchError");
const CampError = require("../utils/CampError");
const Campground = require("../models/Campground");
const mongoose = require("mongoose");
const { isLogin,validateCampground,  isCampgroundAuthor,checkCampgroundExistence } = require("../middleware");



router.get(
  "/",
  CatchError(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/show.ejs", { campgrounds });
  })
);

router.get("/new", isLogin, (req, res) => {
  res.render("campgrounds/newcampground.ejs");
});

router.post(
  "/",
  validateCampground,
  CatchError(async (req, res) => {
    const campground = req.body.campground;
    campground.author = req.user._id;
    const c = new Campground(campground);
    await c.save();
    req.flash("success", "succesfully campground created");
    res.redirect(`/campground/${c._id}`);
  })
);

router.get(
  "/:id/edit",
  checkCampgroundExistence,
  isLogin,
  isCampgroundAuthor,
  CatchError(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit.ejs", { campground });
  })
);

router.put(
  "/:id",
  isCampgroundAuthor,
  CatchError(async (req, res) => {
    const {id}  = req.params;
    const campground = req.body.campground;
    await Campground.updateMany({ _id: id }, campground);
    req.flash("success", "successfully updated the campground");
    res.redirect(`/campground/${id}`);
  })
);

router.delete(
  "/:id",
  checkCampgroundExistence,
  isCampgroundAuthor,
  CatchError(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "successfully deleted the campground");
    res.redirect("/campground");
  })
);
router.get(
  "/:id",
  checkCampgroundExistence,
  CatchError(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CampError(404, "Campground Not Found");
    }
    const campground = await Campground.findById(id)
      .populate({
        path:'reviews',
        populate:{
          path:'author'
        }
      })
      .populate("author")
    // if (!campground) throw new CampError(404, "Campground Not Found");
    console.log(campground);
    res.render("campgrounds/campground.ejs", { campground });
  })
);

module.exports = router;
