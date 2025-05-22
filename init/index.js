const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlove";

const main = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to database");
        await initDB();  // Run initDB only after DB is connected
    } catch (err) {
        console.log("Database connection error:", err);
    }
};

const initDB = async () => {
    try {
        await Listing.deleteMany({});
        initData.sampleListings = initData.sampleListings.map((obj)=>({...obj, owner: "6800c7f2711a03d6b3c94e01"})); // 
        await Listing.insertMany(initData.sampleListings);
        console.log("Database images updated successfully");
    } catch (err) {
        console.log("Error initializing database:", err);
    }
};

main();

