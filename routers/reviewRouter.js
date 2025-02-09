const express = require("express");
const router = express.Router({mergeParams:true});
const CatchError = require('../utils/CatchError')
const CampError = require('../utils/CampError')
const {reviewSchema} = require('../schemas')
const Campground = require('../models/Campground')
const mongoose = require('mongoose')
const Review = require('../models/review')
const {isLogin,validateReview,isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews')

router.post(
    "/",
    isLogin,
    validateReview,
    CatchError(reviews.createReview)
  );
  
  router.delete("/:reviewId",isLogin,isReviewAuthor,reviews.deleteReview);
  module.exports = router