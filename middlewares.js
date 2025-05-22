const Listing = require("./models/listing");
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
      // Only set redirectUrl if it hasn't already been set
      if (!req.session.redirectUrl) {
          req.session.redirectUrl = req.originalUrl;
      }
      req.flash("error", "You must be logged in to create a listing!");
      return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (!req.isAuthenticated() && req.originalUrl !== "/login") {
      req.session.redirectUrl = req.originalUrl;
  }
  res.locals.redirectUrl = req.session.redirectUrl || null;
  console.log("Redirect URL in session:", req.session.redirectUrl); // Debugging
  console.log("Redirect URL in locals:", res.locals.redirectUrl); // Debugging
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

  module.exports.validateReview = (req, res, next) => {        let { error } = reviewSchema.validate(req.body);
        if (error) {
          let errMsg = error.details.map((el) => el.message).join(",");
          throw new ExpressError(400, errMsg);
        } else {
          next();
        }
      };



      module.exports.isReviewOwner = async (req, res, next) => {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
    
        if (!review) {
            req.flash("error", "Review not found!");
            return res.redirect(`/listings/${req.params.id}`);
        }
    
        if (!review.author.equals(req.user._id)) {
            req.flash("error", "You do not have permission to delete this review!");
            return res.redirect(`/listings/${req.params.id}`);
        }
    
        next();
    };


//  module.exports.isReviewOwner = async (req, res, next) => {
//     let {id, reviewId } = req.params;
//     let review = await Listing.findById(reviewId);
//     if (!review.author.equals(res.locals.currentUser._id)) {
//       req.flash("error", "You are not the author of this review!");
//       return res.redirect(`/listings/${id}`);
//     }
//     next();
//   };