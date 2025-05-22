const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };

module.exports.RenderNewForm = (req, res) => {
  try {
    res.render("listings/new.ejs");
  } catch (err) {
    console.error("Error in /listings/new route:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.showListing = async (req, res) => {
  console.log("Incoming request: ", req.params); // Debug log
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews"
, populate: { path: "author" }
  }).populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
 let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();
 
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; 
  newListing.image = {
    url,
    filename
  };
  newListing.geometry = response.body.features[0].geometry;
  
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "new Listing created!");
  res.redirect("/listings");
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }

  const { id } = req.params;
  const { title, description, price, location, country } = req.body.listing;

  // Fetch the existing listing from the database
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  // Update the listing fields
  listing.title = title;
  listing.description = description;
  listing.price = price;
  listing.location = location;
  listing.country = country;

  // If a new file is uploaded, update the image
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  // Geocode the new location and update geometry
  if (location) {
    let response = await geocodingClient.forwardGeocode({
      query: location,
      limit: 1,
    }).send();
    if (response.body.features.length > 0) {
      listing.geometry = response.body.features[0].geometry;
    }
  }

  // Save the updated listing
  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
   return res.redirect("/listings");
  }

  let OriginalImageUrl;

  // Check if the image is hosted on Cloudinary
  if (listing.image.url.includes("res.cloudinary.com")) {
    // Extract the public ID for Cloudinary transformations
    let publicId = listing.image.filename; // Use filename if available
    if (!publicId && listing.image.url) {
      // Extract public ID from the full URL
      const urlParts = listing.image.url.split("/");
      publicId = urlParts.slice(-2).join("/").split(".")[0]; // Extract "folder/filename" without extension
    }

    // Generate the transformed image URL using Cloudinary
    OriginalImageUrl = cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: "fill",
      quality: "50",
    });
  } else {
    // Use the external URL directly
    OriginalImageUrl = listing.image.url;
  }

  res.render("listings/edit.ejs", { listing, OriginalImageUrl });
};