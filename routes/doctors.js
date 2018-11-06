var express = require("express");
var router = express.Router();
var models = require("../app.js");
var middleware = require("../middleware");


router.get("/appointments/:id/medicalHistory", middleware.isLoggedIn, middleware.isDoctor, function(req,res){
	models.Appointment.findById(req.params.id).then(function(appointment){
		models.Patient.findById(appointment.patientID).then(function(patient){
			res.render("Doctor/medicalHistory", {patient:patient});
		})
	})
})

router.get("/appointments/:id", middleware.isLoggedIn, middleware.isDoctor, middleware.hasAppointment, function (req, res) {
	

	models.Appointment.findById(req.params.id).then(function (appointment) {
		models.Patient.findById(appointment.patientID).then(function (patient) {
			models.User.findById(patient.userID).then(function (patientUser) {
				
				res.render("Doctor/doctorAppointmentView", {
					appointment: appointment,
					patient: patient,
					patientUser: patientUser
				});
			})
		});
	});
});




router.delete("/appointments/:id", middleware.isLoggedIn, middleware.isDoctor, function (req, res) {
	
	models.Appointment.destroy({
		where: {
			appointmentID: req.params.id
		}
	}).then(function(){
		res.send("1");
	});

});

router.post("/appointments/:id/end", middleware.isLoggedIn, middleware.isDoctor, function(req,res){
	models.Appointment.findById(req.params.id).then(function(appointment){
		appointment.updateAttributes({isActive: false});
	});
	res.redirect("/dashboard");
})

router.get("/appointments/:pid/documents", middleware.isLoggedIn, middleware.isDoctor, function(req,res){
	models.Documents.findAll({where:{
        patientID: req.params.pid
    }}).then(function(documents){
        res.render("Patient/documents", {documents: documents})
    })
});


router.get("/appointments/:pid/prescribe", middleware.isLoggedIn, middleware.isDoctor, function(req,res){
	models.Patient.findById(req.params.pid).then(function(patient){
		models.User.findById(patient.userID).then(function(patientUser){
			models.Medicine.findAll().then(function(medicines){
				meds = {};
				medNames = []
				quantities = {};
				medicines.forEach(function(medicine){
					meds[medicine.name] = medicine.medicineID;
					medNames.push(medicine.name);
					quantities[medicine.name] = medicine.quantity;
				});
				res.render("Doctor/prescribe", {medicines:medicines, meds: meds, quantities: quantities, medNames:medNames, patientUser:patientUser});
			});
		})
		
	})
	
});

router.post("/appointments/:pid/prescribe", middleware.isLoggedIn, middleware.isDoctor, function(req,res){
	
		models.Patient.findById(req.params.pid).then(function(patient){
			models.Prescription.create	({
				doctorID: req.user.userID,
				patientID: patient.userID,
				medicineID: req.body.medID,
				quantity: req.body.quantity,
				remarks: req.body.remarks,
				currentlyTaking: true,
				served: false
			})
		});
		res.redirect("back");
})

router.get("/appointments/:id/admit", middleware.isLoggedIn, middleware.isDoctor, function(req,res){
	models.Appointment.findById(req.params.id).then(function(appointment){
		models.Patient.findById(appointment.patientID).then(function(patient){
			if (patient.isAdmitted){
				res.render("Doctor/alreadyAdmitted");
			}
			models.User.findById(patient.userID).then(function(patientUser){
				models.Room.findAll().then(function(rooms){
					vacantRooms = [];
					rooms.forEach(function(room){
						if (room.isVacant){
							vacantRooms.push(room.roomNumber);
						}
					
					})
					if (vacantRooms.length === 0){
						res.render("Doctor/noVacant");
					} else {
						res.render("Doctor/admit", {vacantRooms: vacantRooms,appointment:appointment, patient:patient, patientUser:patientUser});
					}
					
				})
			})
			
		})
	})
	

});


router.post("/apppointments/:id/admit", middleware.isLoggedIn, middleware.isDoctor, function(req,res){
	models.Appointment.findById(req.params.id).then(function(appointment){
		models.Room.findById(req.body.roomNumber).then(function(room){
			models.Admission.create({
				doctorID: req.user.userID,
				patientID: appointment.patientID,
				roomNumber: room.roomNumber,
				date: req.body.date,
				isActive: true
			});
			room.updateAttributes({isVacant: false});
			models.Patient.findById(appointment.patientID).then(function(patient){
				patient.updateAttributes({isAdmitted: true});
			})
			res.redirect("/doctors/appointments/" + appointment.appointmentID);
		})
	});
	
})
module.exports = router;