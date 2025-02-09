const express = require("express");
const router = express.Router();
const CatchError = require("../utils/CatchError");
const multer = require('multer')
const {storage} = require('../cloudinary');
const upload = multer({storage});

const {
  isLogin,
  validateCampground,
  isCampgroundAuthor,
  checkCampgroundExistence,
} = require("../middleware");
const campgrounds = require("../controllers/campgrounds");



router.route('/')
  .get(CatchError(campgrounds.showCampgrounds))
  .post(upload.array('image'),validateCampground,CatchError(campgrounds.newCampground) );
  

router.get("/new", isLogin, campgrounds.renderNewCampground);



router.get(
  "/:id/edit",
  checkCampgroundExistence,
  isLogin,
  isCampgroundAuthor,
  CatchError(campgrounds.renderEditCampground)
);
router.route('/:id')
  .get(
  checkCampgroundExistence,
  CatchError(campgrounds.campground)
  )
  .put( isCampgroundAuthor,upload.array('image'),validateCampground, CatchError(campgrounds.updateCampground))
  .delete(
  checkCampgroundExistence,
  isCampgroundAuthor,
  CatchError(campgrounds.deleteCampground)
  )


module.exports = router;
