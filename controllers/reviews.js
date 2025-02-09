const Review = require('../models/review')
const Campground = require('../models/Campground')

module.exports.createReview = async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      const review = new Review(req.body.review);
      review.author = req.user._id;
      campground.reviews.push(review);
      await review.save();
      await campground.save();
      req.flash('success','succesfully created reveiew')
      res.redirect(`/campgrounds/${req.params.id}`);
    }

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    }); // to remove the object id inside of reviews array
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash('success','succesfully deleted reveiew')
    res.redirect(`/campgrounds/${id}`);
  }