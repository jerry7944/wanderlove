const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middlewares.js");
const listingsController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get( wrapAsync(listingsController.index))
.post(isLoggedIn,  upload.single("listing[image]"),validateListing, wrapAsync(listingsController.createListing));


// new route (with better error handling)
router.get("/new", isLoggedIn, listingsController.RenderNewForm);

router.route("/:id")
.get( wrapAsync(listingsController.showListing))
.put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingsController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));


// edit route 
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingsController.renderEditForm));


module.exports = router;
