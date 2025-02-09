const Campground = require("../models/Campground");
const mongoose = require("mongoose");
const CampError = require("../utils/CampError");
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.showCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/show.ejs", { campgrounds });
};

module.exports.renderNewCampground = (req, res) => {
  res.render("campgrounds/newcampground.ejs");
};

module.exports.newCampground = async (req, res) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  const campground = new Campground(req.body.campground);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.geometry = geoData.features[0].geometry;
  campground.author = req.user._id;
  const c = new Campground(campground);
  await c.save();
  req.flash("success", "succesfully campground created");
  res.redirect(`/campgrounds/${c._id}`);
};

module.exports.renderEditCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit.ejs", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  const geoData = await maptilerClient.geocoding.forward( //get the location of the campground
    req.body.campground.location,
    { limit: 1 }
  );
  campground.geometry = geoData.features[0].geometry;

  await Campground.updateMany({ _id: id }, req.body.campground);
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);

  if (req.body.deleteImages) {
    //if there are images to delete
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename); //delete the image from cloudinary
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    }); //delete the image from the database
  }

  await campground.save();
  req.flash("success", "successfully updated the campground");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "successfully deleted the campground");
  res.redirect("/campgrounds");
};

module.exports.campground = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CampError(404, "Campground Not Found");
  }
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // if (!campground) throw new CampError(404, "Campground Not Found");
  res.render("campgrounds/campground.ejs", { campground });
};
