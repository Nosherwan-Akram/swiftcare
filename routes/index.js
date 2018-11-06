var express = require("express");
var router = express.Router();
var models = require("../app.js");
var middleware = require("../middleware");
var passport = require("passport");

var User = models.User;
var Patient = models.Patient;
var Medicine = models.Medicine;
var Counselor = models.Counselor;
var Appointment = models.Appointment;
var Prescription = models.Prescription;
var Receptionist = models.Receptionist;
var Doctor = models.Doctor;


router.get("/", function (req, res) {
    res.render("landing");
});

router.get("/register", function (req, res) {
    res.render("register");
});

router.get("/successfulRegister", function (req, res) {
    res.send("Success!");
});


router.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/successfulRegister',

        failureRedirect: '/failedRegister'
    }

));

router.get("/loginRetry", function(req,res){
    res.render("loginRetry");
})

router.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/dashboard',

    failureRedirect: '/loginRetry'
}));

router.get("/dashboard", middleware.isLoggedIn, function (req, res) {

        
    
        if (req.user.userType === "Doctor") {
            models.Doctor.findOne({
                where: {
                    userID: req.user.userID
                }
            }).then(function (doctor) {
                var subClass = doctor;
                var appointments = models.Appointment.findAll({
                    where: {
                        doctorID: req.user.userID,
                        isActive: true
                    }
                }).then(function (appointments) {
                    
                    res.render("Doctor/doctorDashboard", {
                        user: req.user,
                        subClass: subClass,
                        appointments: appointments
                    });
                    // NEED TO FIX doctor dashboard.
                });
    
            })
        } else if (req.user.userType === "Patient") {
            models.Patient.findOne({
                where: {
                    userID: req.user.userID
                }
            }).then(function (patient) {
                var subClass = patient;
                res.render("Patient/patientDashboard", {
                    user: req.user,
                    subClass: subClass
                });
    
            })
        } else if (req.user.userType === "Receptionist") {
            models.Receptionist.findOne({
                where: {
                    userID: req.user.userID
                }
            }).then(function (receptionist) {
                var subClass = receptionist;
                res.render("Receptionist/receptionistDashboard", {
                    user: req.user,
                    subClass: subClass
                });
    
            })
        }
        else if(req.user.userType === "Pharmacist"){
            models.Pharmacist.findOne({where: {userID: req.user.userID}})
                .then(function(pharmacist){
                    res.render("Pharmacist/pharmacistDashboard", {user: req.user, subClass: pharmacist });
                })
        }
    
        else if (req.user.userType === 'Counselor') {
            models.Counselor.findOne({where: {userID: req.user.userID}})
                .then(function (counselor) {
                    res.render("Counselor/counselorDashboard", {user: req.user, subClass: counselor});
                })
        };
    
    });
    
    
    router.get("/login", function (req, res) {
        res.render("login");
    });

    router.get("/logout", function(req,res){
        req.session.destroy(function(err) {
            
        res.redirect('/');
    })
});

module.exports = router;