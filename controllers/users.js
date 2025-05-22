const User = require("../models/user");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
}; 

module.exports.signup = async (req,res)=>{
    try{
        const {username,email,password} = req.body;
        const newUser = new User({username,email});
        const registeredUser = await User.register(newUser,password);
        req.login(registeredUser, (err)=>{
            if(err) return next(err);
            req.flash("success","Welcome to Wanderlove!");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }  
};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Logged in successfully!");
    const redirectUrl = req.session.redirectUrl || "/listings"; // Use session redirectUrl or default
    req.session.redirectUrl = null; // Clear the redirectUrl explicitly
    console.log("Redirecting to:", redirectUrl); // Debugging
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.flash("success","Logged out successfully!");
        res.redirect("/listings");
    });
};