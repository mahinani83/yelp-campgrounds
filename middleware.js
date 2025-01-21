const Campground = require("./models/Campground")
const review = require("./models/review")
const {campgroundSchema,reviewSchema} = require('./schemas')
const CampError = require('./utils/CampError')
const Review = require('./models/review')


module.exports.isLogin = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.flash('error','you must be log in')
        req.session.returnTo = req.originalUrl
       return res.redirect('/login')
    }
   next()
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new CampError(400, msg);
    } else {
      next();
    }
  };

module.exports.isCampgroundAuthor = async(req,res,next) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','you are not allowed to do this')
        return res.redirect('/login')
    }
    next()
}
module.exports.isReviewAuthor = async(req,res,next) =>{
    const {reviewId,id} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','you are not allowed to do this')
        return res.redirect(`/campground/${id}`)
    }
    next()
}
module.exports.checkCampgroundExistence = async(req,res,next) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','can not find campground')
        return res.redirect('/campground')
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new CampError(400, msg);
    } else {
      next();
    }
  };
