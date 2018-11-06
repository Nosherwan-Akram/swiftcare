var express = require("express");
var router = express.Router();
var models = require("../app.js");
var middleware = require("../middleware");


router.get("/profilePicture", middleware.isLoggedIn, function(req,res){
    res.render("User/uploadPicture");
});

router.post("/profilePicture", middleware.isLoggedIn, function(req,res){
    models.User.findById(req.user.userID).then(function(user){
        var sampleFile = req.files.sampleFile;
        var name = sampleFile.name;
        var extension = name.substr(name.length - 3);

        if ((extension !== "png") && (extension !== "jpg")){
            res.send("Please upload in png or jpg format.");
            return;
        }
        console.log("FILENAME: " + name);
        var path = "public/images/dp/" + user.userID + name;
        sampleFile.mv(path, function(err) {
            if (err){res.send("Error uploading file.");}
          
            else{
                user.updateAttributes({
                    picture: user.userID+name
                });
                res.redirect("/users/profile");
            
            }
      });
    })
});

router.get("/profile", middleware.isLoggedIn, function(req,res){
    res.render("User/profile")
})

router.get("/changepassword", middleware.isLoggedIn, function(req,res){
    res.render("User/password");
})

router.post("/changepassword/:id", middleware.isLoggedIn, function(req,res){
    models.User.findById(req.params.id).then(function(user){
        
        if(!(req.body.current === req.user.password)){
            res.send("ERROR: That is not your current password.");
        }
        else {
            
            user.updateAttributes({password: req.body.new});
            res.redirect("/dashboard")
        }
    })
});

module.exports = router;