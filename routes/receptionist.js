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

function formatDate(date){
    return ('{0}-{1}-{3} {4}:{5}:{6}').replace('{0}', date.getFullYear()).replace('{1}', date.getMonth() + 1).replace('{3}', date.getDay()).replace('{4}', date.getHours()).replace('{5}', date.getMinutes()).replace('{6}', date.getSeconds())
}

router.get("/users", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {

    res.render("Receptionist/users");
});
router.post("/users/new", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    
        models.User.findOne({where:{email: req.body.email}}).then(function(user){
            if(user){
                res.send("There is already a user with that email.");
            }
            else {
                
        if(req.body.userType === "Patient"){
            if(isNaN(req.body.counselorID)){
                res.send("Invalid counselor ID");
            }
    
            models.Counselor.findById(req.body.counselorID).then(function(counselor){
                if(!counselor){
                    res.send("There is no counselor with that ID.");
                }
            })
        }
        
        var email = (req.body.email).toLowerCase();
    
        models.User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            cnic: req.body.cnic,
            gender: req.body.gender,
            phone: req.body.phone,
            birthDate: req.body.birthDate,
            email: email,
            password: req.body.password,
            userType: req.body.userType,
            registeredBy: req.user.userID
        }).then(function(user){
            if (user.userType === "Patient"){
                models.Patient.create({
                    userID: user.userID,
                    hasRequested: false,
                    isAdmitted: false,
                    counselorID: req.body.counselorID
                })
                models.Counselor.findById(req.body.counselorID).then(function(counselor){
                    var numPatients = counselor.noOfPatients + 1;
                    counselor.updateAttributes({noOfPatients: numPatients});
                })
            } else if (user.userType === "Counselor"){
                models.Counselor.create({
                    userID: user.userID,
                    noOfAppointments: 0,
                    noOfPatients: 0
    
                })
            } else if (user.userType === "Doctor"){
                models.Doctor.create({
                    userID: user.userID,
                    workHours: req.body.hours,
                    specialization: req.body.specialization
                })
            } else if (user.userType === "Pharmacist"){
                models.Pharmacist.create({
                    userID: user.userID,
                    prescriptionsServed: 0
                })
            }
            res.redirect("/dashboard");
        })
            }
        })
    
    })

router.get("/users/new", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    res.render("Receptionist/register");
})

router.get("/users/patients", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {
    models.Patient.findAll({include: [{
        model: models.User,
    }]}).then(function (patients) {
        
        res.render("Receptionist/patients", {patients:patients});
    });
});

router.get("/rooms", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Room.findAll().then(function(rooms){
        res.render("Receptionist/rooms", {rooms: rooms});
    })
    
})


router.post("/rooms/new", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Room.create({
        roomNumber: parseInt(req.body.roomNo),
        floor: parseInt(req.body.floor),
        isVacant: true
    }).then(function(room){
        res.redirect("/receptionist/rooms");
    }).catch(function(){
        res.send("ERROR. Make sure Room number is correct and unique.")
    })
})

router.get("/rooms/new", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    res.render("Receptionist/newRoom");
})

router.delete("/rooms", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Room.destroy({
        where: {roomNumber: req.body.id}
    }).then(function(){
        res.send("1");
    })
})

router.get("/users/patients/:id", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {

    models.User.findById(req.params.id).then(function (user) {
        models.Patient.findOne({
            where: {
                userID: req.params.id
            }
        }).then(function (patient) {
            res.render("Receptionist/showPatient", {
                patient: patient,
                user: user
            });
        })
    })
});


router.delete("/users/patients/:id", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {
    models.Patient.destroy({
        where: {
            userID: req.params.id
        }
    }).then(function () {
        models.User.destroy({
            where: {
                userID: req.params.id
            }
        }).then(function () {
            res.redirect("/receptionist/users/patients");
        });
    });
});

router.get("/users/:id/edit", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.User.findById(req.params.id).then(function(user){
        if(user.userType === "Patient"){
            models.Patient.findById(user.userID).then(function(patient){
                res.render("Receptionist/editUser", {user:user, subclass: patient});
            })
        }
        if(user.userType === "Doctor"){
            models.Doctor.findById(user.userID).then(function(doctor){
                res.render("Receptionist/editUser", {user:user, subclass: doctor});
            })
        } 
        if(user.userType === "Counselor"){
            models.Counselor.findById(user.userID).then(function(counselor){
                res.render("Receptionist/editUser", {user:user, subclass: counselor});
            })
        } 
        if(user.userType === "Pharmacist"){
            models.Pharmacist.findById(user.userID).then(function(pharmacist){
                res.render("Receptionist/editUser", {user:user, subclass: pharmacist});
            })
        } 
        if(user.userType === "Receptionist"){
            models.Receptionist.findById(user.userID).then(function(receptionist){
                res.render("Receptionist/editUser", {user:user, subclass: receptionist});
            })
        } 
    })
})

router.post("/users/:id/edit", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.User.findById(req.params.id).then(function(user){

    
        if(user){
            user.updateAttributes({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                cnic: req.body.cnic,
                gender: req.body.gender,
                phone: req.body.phone,
                birthDate: req.body.birthDate,
                email: req.body.email,
                
            })
            if (user.userType === "Patient"){
                models.Pateint.findById(user.userID).then(function(patient){

                
                    patient.updateAttributes({
                        counselorID: req.body.counselorID
                    })
                })
            
            } else if (user.userType === "Doctor"){
                models.Doctor.findById(user.userID).then(function(doctor){
                    doctor.updateAttributes({
                        workHours: req.body.hours,
                        specialization: req.body.specialization
                    })
                })
                    
            
        }
        res.redirect("/receptionist/users");
     }
      else {
            res.send("Invalid ID");
        }
    })
});

router.put("/users/edit/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.User.findById(req.params.id).then(function(user){
        if(user){
            user.updateAttributes({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                cnic: req.body.cnic,
                gender: req.body.gender,
                phone: req.body.phone,
                birthDate: req.body.birthDate,
                email: req.body.email   
            })
        }
    })
})

router.delete("/users/pharmacists/:id", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {
    models.Pharmacist.destroy({
        where: {
            userID: req.params.id
        }
    }).then(function () {
        models.User.destroy({
            where: {
                userID: req.params.id
            }
        }).then(function () {
            res.redirect("/receptionist/users/pharmacists");
        });
    });
});

router.get("/users/doctors", function (req, res) {
    models.Doctor.findAll({include: [{
        model: models.User,
    }]}).then(function (doctors) {
        
        res.render("Receptionist/doctors", {doctors:doctors});
    });
});

router.get("/users/doctors/:id", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {
    
        models.User.findById(req.params.id).then(function (user) {
            models.Doctor.findOne({
                where: {
                    userID: req.params.id
                }
            }).then(function (doctor) {
                res.render("Receptionist/showDoctor", {
                    doctor: doctor,
                    user: user
                });
            })
        })
    });

router.delete("/users/doctors/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Doctor.destroy({
        where: {
            userID: req.params.id
        }
    }).then(function () {
        models.User.destroy({
            where: {
                userID: req.params.id
            }
        }).then(function(){
            res.redirect("/receptionist/users/doctors");
        })
    })
});

router.get("/users/counselors", function (req, res) {
    models.Counselor.findAll({include: [{
        model: models.User,
    }]}).then(function (counselors) {
        
        res.render("Receptionist/counselors", {counselors:counselors});
    });
});

router.get("/users/counselors/:id", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {
    
    models.User.findById(req.params.id).then(function (user) {
        models.Counselor.findOne({
            where: {
                userID: req.params.id
            }
        }).then(function (counselor) {
            res.render("Receptionist/showCounselor", {
                counselor: counselor,
                user: user
            });
        })
    })

});

router.delete("/users/counselors/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Counselor.destroy({
        where: {
            userID: req.params.id
        }
    }).then(function () {
        models.User.destroy({
            where: {
                userID: req.params.id
            }
        }).then(function(){
            res.redirect("/receptionist/users/counselors");
        })
    })
});

router.get("/users/pharmacists", middleware.isLoggedIn, middleware.isReceptionist,function (req, res) {
    models.Pharmacist
    
    
    .findAll({include: [{
        model: models.User,
    }]}).then(function (pharmacists) {
        res.render("Receptionist/pharmacists", {pharmacists:pharmacists});
    });
});

router.get("/users/pharmacists/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.User.findById(req.params.id).then(function (user) {
        models.Pharmacist.findOne({
            where: {
                userID: req.params.id
            }
        }).then(function (pharmacist) {
            res.render("Receptionist/showPharmacist", {
                pharmacist: pharmacist,
                user: user
            });
        })
    })

});


router.get("/appointments/new", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {
    models.Doctor.findAll({include: [{
        model: models.User,
    }]}).then(function(doctors){
        res.render("Receptionist/newAppointment", {doctors: doctors});
    })
    
});

router.post("/appointments", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {

    if(isNaN(req.body.patientID)){
        res.send("Invalid patient ID. Please try again.");
    }


    models.Patient.findById(parseInt(req.body.patientID)).then(function(patient){
        if(patient){
            var parsedDate = new Date(Date.parse(req.body.appDate))
            var newDate = new Date(parsedDate.getTime() - (1000 * 18000))
                models.Appointment.create({
                    date: newDate,
                    isActive: true,
                    doctorID: parseInt(req.body.doctorID),
                    patientID: parseInt(req.body.patientID),
                    notes: req.body.notes
            }).then(function(){
                res.render("Receptionist/appointmentCreated");
            })
        }
        else{
            res.send("There is no patient with that ID.")
        }
    })


});

router.get("/appointments", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    res.render("Receptionist/appointments");
});

router.get("/activeAppointments", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {
    models.Appointment.findAll({
        where: {
            isActive: true
        }
    }).then(function (appointments) {
        res.render("Receptionist/activeAppointments", {
            appointments: appointments
        });
    });
});


router.get("/oldAppointments", middleware.isLoggedIn, middleware.isReceptionist, function (req, res) {
    models.Appointment.findAll({
        where: {
            isActive: false
        }
    }).then(function (appointments) {
        res.render("Receptionist/oldAppointments", {
            appointments: appointments
        });
    });
});

router.get("/appointments/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Appointment.findById(req.params.id).then(function(appointment){
        console.log("=====================");
        console.log(appointment.date);
        console.log("=====================");
        if(appointment){
        models.Patient.findById(appointment.patientID).then(function(patient){
            models.User.findById(patient.userID).then(function(patientUser){
                if(appointment.doctorID){
                    type = "doctor";
                    models.Doctor.findById(appointment.doctorID).then(function(doctor){
                        models.User.findById(doctor.userID).then(function(doctorUser){
                            res.render("Receptionist/showAppointment", {appointment:appointment, patient: patient, doctor:doctor, patientUser:patientUser, doctorUser: doctorUser});
                        })
                        
                    });
                }
                else{
                    type = "counselor"
                    models.Counselor.findById(appointment.counselorID).then(function(counselor){
                        models.User.findById(counselor.userID).then(function(counselorUser){
                            res.render("Receptionist/showCounselorAppointment", {appointment: appointment, patient: patient, counselor:counselor, patientUser:patientUser, counselorUser: counselorUser});
                        })
                        
                    })
                }
            })

            
        })
    }
    else {
        res.send("No appointment with that ID exists.");
    }
    });
});

router.get("/admissions", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    res.render("Receptionist/admissions");
});

router.get("/activeAdmissions", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Admission.findAll({where: {isActive: true}}).then(function(admissions){
        res.render("Receptionist/showAdmissions", {admissions:admissions});
    });
});

router.get("/oldAdmissions", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Admission.findAll({where: {isActive: false}}).then(function(admissions){
        res.render("Receptionist/showAdmissions", {admissions:admissions});
    });
});

router.post("/completeAdmission/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Admission.findById(req.params.id).then(function(admission){
        if(admission){
        admission.updateAttributes({isActive: false});
        models.Room.findById(admission.roomNumber).then(function(room){
            room.updateAttributes({isVacant: true});
            res.send("1");
        })
        }
        else{
            res.send("Invalid admission ID");
        }
    });
});


router.delete("/deleteAdmissionActive/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Admission.findById(req.params.id).then(function(admission){
       if(admission){
            models.Room.findById(admission.roomNumber).then(function(room){
                room.updateAttributes({isVacant: true});
                models.Admission.destroy({where: {admissionID: req.params.id}}).then(function(){
                    res.send("1");
                })
            })
       }
       else {
           res.send("Invalid admission ID");
       }
        
    })
    
});

router.delete("/deleteAdmissionOld/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    models.Admission.destroy({where: {admissionID: req.params.id}}).then(function(){
        
         models.Admission.destroy({where: {admissionID: req.params.id}}).then(function(){
            res.send("1");
         })
    })
});


router.delete("/appointments/:id", middleware.isLoggedIn, middleware.isReceptionist, function(req,res){
    console.log("Reached delete route");
    models.Appointment.destroy({where: {appointmentID: req.params.id}}).then(function(){
        res.send("1");
    })
});

module.exports = router;