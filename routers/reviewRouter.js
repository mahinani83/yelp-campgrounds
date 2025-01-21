const express = require("express");
const router = express.Router({mergeParams:true});
const CatchError = require('../utils/CatchError')
const CampError = require('../utils/CampError')
const {reviewSchema} = require('../schemas')
const Campground = require('../models/Campground')
const mongoose = require('mongoose')
const Review = require('../models/review')
const {isLogin,validateReview,isReviewAuthor} = require('../middleware')

router.post(
    "/",
    isLogin,
    validateReview,

    CatchError(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      const review = new Review(req.body.review);
      review.author = req.user._id;
      campground.reviews.push(review);
      await review.save();
      await campground.save();
      req.flash('success','succesfully created reveiew')
   
      res.redirect(`/campground/${req.params.id}`);
    })
  );
  
  router.delete("/:reviewId",isLogin,isReviewAuthor, async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    }); // to remove the object id inside of reviews array
    
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash('success','succesfully deleted reveiew')
    res.redirect(`/campground/${id}`);
  });
  
  module.exports = router