var express = require("express");
var router = express.Router();
var models = require("../app.js");
var middleware = require("../middleware");


router.get("/requests", middleware.isLoggedIn, middleware.isCounselor, function (req, res) {
	models.Patient.findAll({where: {counselorID: req.user.userID, hasRequested: true},include: [{
        model: models.User,
    }]})
		.then(function (patientsWithRequest) {
			res.render("Counselor/requestsIndex", {patients: patientsWithRequest});
        })
});

router.get("/appointments/:id", middleware.isLoggedIn, middleware.isCounselor, function (req, res) {
	models.Patient.findOne({where: {userID: req.params.id}})
		.then(function (patient) {
			models.User.findOne({where:{userID: req.params.id}}).then(function(user){
				res.render("Counselor/appointmentNew", {patient: patient, user:user})
			})
            
        })
});
router.get("/appointments", middleware.isLoggedIn, middleware.isCounselor, function (req, res) {
    patientArray = [];
	models.Appointment.findAll({where: {counselorID: req.user.userID, isActive: true},
		include: [
			{
			  model: models.Patient, 
			  include: [
				models.User
			  ]  
			}
		  ]})
        .then(function (appointments) {
             res.render("Counselor/appointmentIndex", {appointments: appointments});
        })
});

router.post("/appointments", middleware.isLoggedIn, middleware.isCounselor, function (req, res) {
	var parsedDate = new Date(Date.parse(req.body.appDate))
	var newDate = new Date(parsedDate.getTime() - (1000 * 18000))
	models.Appointment.create(
		{
			date: newDate,
			notes: req.body.notes,
			patientID: parseInt(req.body.patientID),
			isActive: true,
			counselorID: parseInt(req.user.userID)
		}
	)
		.then(function (appointment) {
			models.Patient.findById(parseInt(req.body.patientID)).then(function(patient){
				patient.updateAttributes({hasRequested: false});
			})
			res.redirect("/counselors/appointments");
        })
});

router.get("/patients", middleware.isLoggedIn, middleware.isCounselor, function (req, res) {
    models.Patient.findAll({where:{counselorID: req.user.userID},include: [{
        model: models.User,
    }]}).then(function (patients) {
		res.render("Counselor/counselorPatientIndex", {patients: patients});
	})
});

router.patch("/appointments/:id", function (req, res) {
	models.Appointment.update({isActive: false}, {where: {appointmentID: req.params.id}})
		.then(function () {
			res.redirect("/counselors/appointments");
        })
});

module.exports = router;	