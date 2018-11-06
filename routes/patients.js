var express = require("express");
var router = express.Router();
var models = require("../app.js");
var middleware = require("../middleware");
var User = models.User;
var Patient = models.Patient;
var Medicine = models.Medicine;
var Counselor = models.Counselor;
var Appointment = models.Appointment;
var Prescription = models.Prescription;


router.post("/medicalHistory", middleware.isLoggedIn, middleware.isPatient, function(req,res){
    models.Patient.findById(req.user.userID).then(function(patient){
        if(patient){
            patient.updateAttributes({medicalHistory: req.body.history});
            res.redirect("back");
        }
        else {
            res.send("Invalid id.")
        }
        
    })
})

router.get("/appointments", middleware.isLoggedIn, middleware.isPatient, function (req, res) {
    models.Appointment.findAll({
        where: {
            patientID: req.user.userID,
            isActive: true,
            counselorID: null
        },include: [{
            model: models.Doctor,
            include: [models.User]
            
        }]
    }).then(function (appointments) {
        models.Appointment.findAll({
            where: {
                patientID: req.params.id,
                isActive: false
            }, include: [{
                model: models.Doctor,
                include: [models.User]
            }]
        }).then(function (oldAppointments) {
            res.render("Patient/patientAppointments", {
                appointments: appointments,
                oldAppointments: oldAppointments
            });
        })

    })
});

router.get("/counselorAppointments", middleware.isLoggedIn, middleware.isPatient, function (req, res) {
    models.Appointment.findAll({
        where: {
            patientID: req.user.userID,
            isActive: true,
            doctorID: null
        },include: [{
            model: models.Counselor,
            include: [models.User]
            
        }]
    }).then(function (appointments) {
        models.Appointment.findAll({
            where: {
                patientID: req.params.id,
                isActive: false
            }, include: [{
                model: models.Counselor,
                include: [models.User]
            }]
        }).then(function (oldAppointments) {
            res.render("Patient/patientCounselorAppointments", {
                appointments: appointments,
                oldAppointments: oldAppointments
            });
        })

    })
});



router.get("/:id/prescriptions", middleware.isLoggedIn, middleware.isPatient, function (req, res) {
    models.Prescription.findAll({
        where: {
            patientID: req.params.id,
            currentlyTaking: true
        }, include: [{model: models.Medicine}]
    }).then(function(prescriptions){
        models.Prescription.findAll({
            where: {
                patientID: req.params.id,
                currentlyTaking: false
            }, include: [{model: models.Medicine}]
        }).then(function(oldPrescriptions){
            res.render("Patient/patientPrescriptions", {prescriptions: prescriptions, oldPrescriptions: oldPrescriptions});
        })
    })

        

    });

router.post("/prescriptions/:pid", function (req, res) {
    models.Prescription.findById(req.params.pid).then(function (prescription) {
        if (prescription.patientID == req.user.userID) {
            prescription.updateAttributes({currentlyTaking: false});
            res.redirect("/patients/" + prescription.patientID + "/prescriptions");
        } else {
            res.send("You don't have permission to do that");
        }
    });
});

router.get("/:id/counselor", middleware.isLoggedIn, middleware.isPatient, function (req, res) {
    console.log(req.user.userID);
    models.Patient.findById(req.user.userID).then(function (patient) {
        models.Counselor.findOne({
            where: {
                userID: patient.counselorID
            }, include: [{model: models.User,}]
        }).then(function (counselor) {
            res.render("Patient/patientCounselor", {counselor:counselor});
        })
    })
});

router.post("/:id/counselor/:counselorID", middleware.isLoggedIn, middleware.isPatient, function(req,res){
    models.Patient.findById(req.user.userID).then(function(patient){
        if (!patient.hasRequested){
            patient.updateAttributes({hasRequested:true});
            res.render("Patient/Requested");
        }
        else {
            res.render("Patient/alreadyRequested");
        }
    })
});


router.get("/:id/history/", middleware.isLoggedIn, middleware.isPatient, function (req, res) {
    models.Patient.findById(req.params.id).then(function (patient) {
        res.render("Patient/patientHistory", {
            patient: patient
        });
    })
});

router.get("/documents", middleware.isLoggedIn, middleware.isPatient, function(req,res){
    models.Documents.findAll({where:{
        patientID: req.user.userID
    }}).then(function(documents){
        res.render("Patient/documents", {documents: documents});
    })
});


router.get("/documents/upload", middleware.isLoggedIn, middleware.isPatient, function(req,res){
    res.render("Patient/documentUpload");
})

router.post("/documents", middleware.isLoggedIn, middleware.isPatient, function(req,res){
    if (!req.files)
     {res.send("-99");}

        models.Patient.findById(req.user.userID).then(function(patient){
            var sampleFile = req.files.sampleFile;
            var desc = req.body.desc;
            models.Documents.create({
                description: desc
            }).then(function(document){

                var id = document.docID;
                var name = sampleFile.name;
                var extension = name.substr(name.length - 3);


                if ((extension !== "png") && (extension !== "jpg")){
                    res.send("Please upload in PNG or JPG format.");
                    return;
                }
                var filename = document.docID + "." + extension;
                var path = "public/images/" + filename;
                document.updateAttributes({path:filename, patientID: req.user.userID});
                
                sampleFile.mv(path, function(err) {
                    if (err){res.send("-1");}
                      
                  
                    else{res.redirect('back');}
              });

            })
            // Use the mv() method to place the file somewhere on your server
            
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
 
});
});
module.exports = router;