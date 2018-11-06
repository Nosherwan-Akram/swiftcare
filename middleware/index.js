var models = require("../app.js");
const Sequelize = require('sequelize');
var User = models.User;
var Receptionist = models.Receptionist;
var Patient = models.Patient;
var Counselor = models.Counselor;
var Doctor = models.Doctor;
var Appointment = models.Appointment;
var Prescription = models.Prescription;
var Room = models.Room;
var Pharmacist = models.Pharmacist;
var Admission = models.Admission;


module.exports = {

    isPharmacist: function(req, res, next) {
        if (req.user.userType == "Pharmacist") {
            return next();
        }
        res.send("You are not authorized.")
    },

    isCounselor: function(req, res, next) {
        if (req.user.userType == "Counselor") {
            return next();
        }
        res.send("You are not authorized.")
    },

    isDoctor: function (req, res, next) {
        if (req.user.userType === "Doctor") {
            return next();
        }
        res.redirect("/login");
    },

    hasAppointment: function (req, res, next) {
        models.Appointment.findById(req.params.id).then(function (appointment) {

            if (appointment) {

                if ((req.user.userID == appointment.counselorID) || (req.user.userID == appointment.patientID) ||
                    (req.user.userID == appointment.doctorID)) {

                    return next();
                } else {
                    res.redirect("/login");
                }
            }
        });

    },


    isPatient: function (req, res, next) {

        if (req.user.userType === "Patient") {
            return next();
        }
        res.send("YOU DON'T HAVE PERMISSION TO VIEW THIS");
    },

    isLoggedIn: function (req, res, next) {
        if (req.isAuthenticated()) {

            return next();
        }

        res.redirect("/login");
    },

    isReceptionist: function (req, res, next) {
        if (req.user.userType === "Receptionist") {

            return next();
        }

        res.send("YOU DON'T HAVE PERMISSION TO DO THAT");
    }
};