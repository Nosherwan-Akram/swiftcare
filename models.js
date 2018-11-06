
module.exports = function(Sequelize, sequelize){
 const User = sequelize.define('User', {
  userID:
	  {
	  	primaryKey: true,
	  	autoIncrement: true,
	  	type: Sequelize.INTEGER
	  },

	 firstName: Sequelize.STRING,
	 lastName: Sequelize.STRING,
	 cnic: Sequelize.STRING(15),
	 phone: Sequelize.STRING(13),
	 gender: Sequelize.STRING(1),
	 birthDate: Sequelize.DATEONLY,
	 email: Sequelize.STRING,
	 password: Sequelize.STRING,
	 userType: Sequelize.STRING,
	 registeredBy: Sequelize.INTEGER,
	 contact: Sequelize.STRING(11),
	 picture: Sequelize.STRING
});


const Patient = sequelize.define('Patient', {
	
	userID: {
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	medicalHistory: Sequelize.STRING(5000),
	isAdmitted: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
    hasRequested:
	{
        type: Sequelize.BOOLEAN,
    	defaultValue: false
	}
});

const Documents = sequelize.define('Documents', {
	docID: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	path:{
		type: Sequelize.STRING(1000),
	},
	description: Sequelize.STRING(1000)
});


const Doctor = sequelize.define('Doctor', {

	userID: {
		type: Sequelize.INTEGER,
		primaryKey: true
	},
  
  specialization: Sequelize.STRING,
  workHours: Sequelize.STRING
});

const Counselor = sequelize.define('Counselor', {

	userID: {
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	noOfPatients: Sequelize.INTEGER,
	noOfAppointments: Sequelize.INTEGER
});

const Pharmacist = sequelize.define('Pharmacist', {

	userID: {
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	prescriptionsServed: Sequelize.INTEGER
});

const Receptionist = sequelize.define('Receptionist', {
});



const Appointment = sequelize.define('Appointment', {
	appointmentID: {
		primaryKey: true,
		autoIncrement: true,
		type: Sequelize.INTEGER
	},
	date: Sequelize.DATE,
	held: Sequelize.BOOLEAN,
	isActive: Sequelize.BOOLEAN,
	notes: Sequelize.STRING

});



const Room = sequelize.define("Room", {

	roomNumber:{
		primaryKey: true,
		type: Sequelize.INTEGER
	},
	floor: Sequelize.INTEGER,
	isVacant: Sequelize.BOOLEAN
});

const Admission = sequelize.define("Admission", {
	admissionID: {
		primaryKey: true,
		autoIncrement: true,
		type: Sequelize.INTEGER
	},
	date: Sequelize.DATE,
	isActive: Sequelize.BOOLEAN
});

const Medicine = sequelize.define("Medicine", {
	medicineID: {
		primaryKey: true,
		autoIncrement: true,
		type: Sequelize.INTEGER
	},
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	quantity: Sequelize.INTEGER,
	cost: Sequelize.INTEGER
});

const Prescription = sequelize.define("Prescription", {
	prescriptionID: {
		primaryKey: true,
		autoIncrement: true,
		type: Sequelize.INTEGER
	},
	quantity: Sequelize.INTEGER,
	remarks: Sequelize.STRING,
	currentlyTaking: Sequelize.BOOLEAN,
	served: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	}
});

Documents.belongsTo(Patient, {foreignKey: "patientID", targetKey: "userID"},{onUpdate: "NO ACTION"});

// defining relationships (1 to 1 relationship between User and subtypes)


Doctor.belongsTo(User, {foreignKey: "userID", targetKey: "userID"}, {onUpdate: "NO ACTION"});
Patient.belongsTo(User , {foreignKey: "userID", targetKey: "userID"}, {onUpdate: "NO ACTION"});
Counselor.belongsTo(User, {foreignKey: "userID", targetKey: "userID"}, {onUpdate: "NO ACTION"});
Receptionist.belongsTo(User, {foreignKey: "userID", targetKey: "userID"}, {onUpdate: "NO ACTION"});
Pharmacist.belongsTo(User, {foreignKey: "userID", targetKey: "userID"}, {onUpdate: "NO ACTION"});
Patient.belongsTo(Counselor, {foreignKey:"counselorID", targetKey: "userID"},{onUpdate: "NO ACTION"})


// Appointment relations:
Appointment.belongsTo(Patient, {foreignKey: "patientID", targetKey: "userID"},{onUpdate: "NO ACTION"});
Appointment.belongsTo(Doctor, {foreignKey: "doctorID",targetKey: "userID"},{onUpdate: "NO ACTION"});
Appointment.belongsTo(Counselor, {foreignKey: "counselorID", targetKey: "userID"},{onUpdate: "NO ACTION"});

/* sequelize.query("ALTER TABLE Appointments DROP FOREIGN KEY Appointments_ibfk_1;");
sequelize.query("ALTER TABLE Appointments DROP FOREIGN KEY Appointments_ibfk_2;");
sequelize.query("ALTER TABLE Appointments DROP FOREIGN KEY Appointments_ibfk_3;"); */



// Admission relations:
Admission.belongsTo(Patient, {foreignKey:"patientID", targetKey: "userID"},{onUpdate: "NO ACTION"});
Admission.belongsTo(Doctor, {foreignKey: "doctorID",targetKey: "userID"},{onUpdate: "NO ACTION"});
Admission.belongsTo(Room, {foreignKey: "roomNumber",targetKey: "roomNumber"},{onUpdate: "NO ACTION"});

/* sequelize.query("ALTER TABLE Admissions DROP FOREIGN KEY Admissions_ibfk_1;");
sequelize.query("ALTER TABLE Admissions DROP FOREIGN KEY Admissions_ibfk_2;");
sequelize.query("ALTER TABLE Admissions DROP FOREIGN KEY Admissions_ibfk_3;"); */


//Prescription relations:
Prescription.belongsTo(Patient, {foreignKey:"patientID", targetKey: "userID"},{onUpdate: "NO ACTION"});
Prescription.belongsTo(Doctor, {foreignKey:"doctorID", targetKey: "userID"},{onUpdate: "NO ACTION"});
Prescription.belongsTo(Medicine, {foreignKey:"medicineID", targetKey: "medicineID"},{onUpdate: "NO ACTION"});
Prescription.belongsTo(Pharmacist, {foreignKey:"pharmacistID", targetKey: "userID"},{onUpdate: "NO ACTION"});

/* sequelize.query("ALTER TABLE Prescriptions DROP FOREIGN KEY Prescriptions_ibfk_1;")
sequelize.query("ALTER TABLE Prescriptions DROP FOREIGN KEY Prescriptions_ibfk_2;")
sequelize.query("ALTER TABLE Prescriptions DROP FOREIGN KEY Prescriptions_ibfk_3;")
sequelize.query("ALTER TABLE Prescriptions DROP FOREIGN KEY Prescriptions_ibfk_4;") */

// RESET DATABASE
/* Appointment.destroy({where:{}}).then(function(){});
Prescription.destroy({where:{}}).then(function(){});
Admission.destroy({where:{}}).then(function(){});
Room.destroy({where:{}}).then(function(){});
Medicine.destroy({where:{}}).then(function(){});

Patient.destroy({where:{}}).then(function(){});
Doctor.destroy({where:{}}).then(function(){});
Receptionist.destroy({where:{}}).then(function(){});
Pharmacist.destroy({where:{}}).then(function(){});
Counselor.destroy({where:{}}).then(function(){});
User.destroy({where:{}}).then(function(){}); */


// CREATE NEW INSTANCES



/* User.create({
	userID: 1,
  firstName: "Counselor",
  lastName: "One",
  cnic: "12345-6789",
  gender: "M",
  phone: "12345",
  birthDate: "10-12-1990",
  email: "c1@gmail.com",
  password: "123",
  userType: "Counselor",
  registeredBy: 1
}).then(function(user){
	Counselor.create({
		userID: user.userID,
		noOfAppointments: 2,
		noOfPatients: 2
	}).then(function(counselor){
		counselor.setUser(user);
	})
});
    User.create({
        userID: 2,
        firstName: "Counselor",
        lastName: "Two",
        cnic: "12345-6790",
        gender: "M",
        phone: "12345",
        birthDate: "10-12-1990",
        email: "c2@gmail.com",
        password: "123",
        userType: "Counselor",
        registeredBy: 1
    }).then(function(user){
        Counselor.create({
            userID: user.userID,
            noOfAppointments: 1,
            noOfPatients: 1
        }).then(function(counselor){
            counselor.setUser(user);
        })
    });
    User.create({
        userID: 3,
        firstName: "Counselor",
        lastName: "Three",
        cnic: "12345-6791",
        gender: "M",
        phone: "12345",
        birthDate: "10-12-1990",
        email: "c3@gmail.com",
        password: "123",
        userType: "Counselor",
        registeredBy: 1
    }).then(function(user){
        Counselor.create({
            userID: user.userID,
            noOfAppointments: 0,
            noOfPatients: 0
        }).then(function(counselor){
            counselor.setUser(user);
        })
    });


	User.create({

		userID: 4,
		firstName: "Patient",
		lastName: "One",
		cnic: "12345-6789",
		gender: "M",
		phone: "12345",
		birthDate: "10-12-1990",
		email: "p1@gmail.com",
		password: "123",
		userType: "Patient",
		registeredBy: 1

	}).then(function(user){
		Patient.create(
			{
				userID: user.userID,
				counselorID:1,
				medicalHistory: "Medical history of patient 1",
				isAdmitted: false,
				hasRequested: true
			}
		).then(function(patient){
			patient.setUser(patient);
		})
	});

User.create({
	userID: 5,
	firstName: "Patient",
	lastName: "Two",
	cnic: "12345-6789",
	gender: "M",
	phone: "12345",
	birthDate: "10-12-1990",
	email: "p2@gmail.com",
	password: "123",
	userType: "Patient",
	registeredBy: 1
}).then(function(user){
	Patient.create(
		{
			userID: user.userID,
			counselorID:1,
			medicalHistory: "Medical history of patient 2",
			isAdmitted: false,
			hasRequested: true
		}
	).then(function(patient){
		patient.setUser(user);
	})
});


User.create({
	userID: 6,
  firstName: "Patient",
  lastName: "Three",
  cnic: "12345-6789",
  gender: "M",
  phone: "12345",
  birthDate: "10-12-1990",
  email: "p3@gmail.com",
  password: "123",
  userType: "Patient",
  registeredBy: 1
}).then(function(user){
	Patient.create({
	userID: user.userID,
	counselorID:1,
	medicalHistory: "Medical history of patient 3",
	isAdmitted: false
	}).then(function(patient){
		patient.setUser(user);
	})
});


User.create({
	userID: 7,
  firstName: "Patient",
  lastName: "Four",
  cnic: "12345-6789",
  gender: "M",
  phone: "12345",
  birthDate: "10-12-1990",
  email: "p4@gmail.com",
  password: "123",
  userType: "Patient",
  registeredBy: 1
}).then(function(user){
	Patient.create({
	userID: user.userID,
	counselorID:1,
	medicalHistory: "Medical history of patient 4",
	isAdmitted: false
	}).then(function(patient){
		patient.setUser(user);
	})
});

User.create({
	userID: 8,
  firstName: "Patient",
  lastName: "Five",
  cnic: "12345-6789",
  gender: "M",
  phone: "12345",
  birthDate: "10-12-1990",
  email: "p5@gmail.com",	
  password: "123",
  userType: "Patient",
  registeredBy: 1
}).then(function(user){
	Patient.create({
	userID: user.userID,
	counselorID:1,
	medicalHistory: "Medical history of patient 5",
	isAdmitted: false
	}).then(function(patient){
		patient.setUser(user);
	})
});

User.create({
	userID: 9,
  firstName: "Doctor",
  lastName: "One",
  cnic: "12345-6789",
  gender: "M",
  phone: "12345",
  birthDate: "10-12-1990",
  email: "d1@gmail.com",
  password: "123",
  userType: "Doctor",
  registeredBy: 1
}).then(function(user){
	Doctor.create({
		userID: user.userID,
		workHours: "Fixed",
		specialization: "specialization A"
	}).then(function(doctor){
		doctor.setUser(user);
	})});

User.create({
	userID: 10,
  firstName: "Doctor",
  lastName: "Two",
  cnic: "12345-6789",
  gender: "M",
  phone: "12345",
  birthDate: "10-12-1990",
  email: "d2@gmail.com",
  password: "123",
  userType: "Doctor",
  registeredBy: 1
}).then(function(user){
	Doctor.create({
		userID: user.userID,
		workHours: "Not Fixed",
		specialization: "specialization B"
	}).then(function(doctor){
		doctor.setUser(user);
	})
});

User.create({
	userID: 11,
  firstName: "Pharmacist",
  lastName: "One",
  cnic: "12345-6789",
  gender: "M",
  phone: "12345",
  birthDate: "10-12-1990",
  email: "ph1@gmail.com",
  password: "123",
  userType: "Pharmacist",
  registeredBy: 1
}).then(function(user){
	Pharmacist.create({
		userID: user.userID,
		prescriptionsServed: 0
	}).then(function(pharmacist){
		pharmacist.setUser(user);
	})
});


User.create({
	userID: 12,
  firstName: "Receptionist",
  lastName: "One",
  cnic: "12345-6789",
  gender: "M",
  phone: "12345",
  birthDate: "10-12-1990",
  email: "r1@gmail.com",
  password: "123",
  userType: "Receptionist",
  registeredBy: 1
}).then(function(user){
	Receptionist.create({
		userID: user.userID,
	}).then(function(receptionist){
		receptionist.setUser(user);
	})
});




Appointment.create({
	
		date: sequelize.fn('NOW'),
		notes: "First Appointment",
		held: false,
		patientID: 4,
		doctorID: 9,
		isActive: true
	});
	
	Appointment.create({
		date: sequelize.fn('NOW'),
		notes: "Appointment between Doc 2 and Patient 2",
		held: false,
		patientID: 5,
		doctorID: 10,
		isActive: true
	});
	
	Appointment.create({
		date: sequelize.fn('NOW'),
		notes: "First Appointment",
		held: false,
		patientID: 6,
		doctorID: 9,
		isActive: true
	});
	
	Appointment.create({
		date: sequelize.fn('NOW'),
		notes: "First Appointment",
		held: false,
		patientID: 7,
		counselorID: 1,
		isActive: true
	});
	
	Appointment.create({
		date: sequelize.fn('NOW'),
		notes: "First Appointment",
		held: false,
		patientID: 8,
		counselorID: 1,
		isActive: true
	});
	Appointment.create({
			date: sequelize.fn('NOW'),
			notes: "First Appointment",
			held: false,
			patientID: 6,
			counselorID: 1,
			isActive: true
		});
	
	
	Medicine.create({
		medicineID: 1,
		name: "Medicine One",
		description: "description of medicine one",
		quantity: 10,
		cost: 9.99
	});
	
	Medicine.create({
		medicineID: 2,
		name: "Medicine Two",
		description: "Description of medicine two",
		quantity: 12,
		cost: 0.99
	});
	
	Medicine.create({
		medicineID: 3,
		name: "Medicine Three",
		description: "description of medicine three",
		quantity: 7,
		cost: 21.99
	});
	
	Prescription.create({
		prescriptionID: 1,
		doctorID: 9, 
		patientID:5,
		medicineID: 2,
		quantity: 99,
		remarks: "Take as needed",
		currentlyTaking: true,
		served: false
	});
	
	Prescription.create({
		prescriptionID: 2,
		doctorID: 10, 
		patientID:6,
		medicineID: 1,
		quantity: 1,
		remarks: "Take as needed",
		currentlyTaking: true,
		served: false
	});
	
	Room.create({
		roomNumber: 1,
		floor: 1,
		isVacant: false
	});
	
	
	Room.create({
		roomNumber: 2,
		floor: 1,
		isVacant: false
	});
	
	Room.create({
		roomNumber: 3,
		floor: 1,
		isVacant: true
	});
	
	Room.create({
		roomNumber: 1,
		floor: 2,
		isVacant: true
	});
	
	Room.create({
		roomNumber: 1,
		floor: 2,
		isVacant: true
	});
	
	Admission.create({
		admissionID:1,
		patientID:5,
		doctorID:9,
		roomNumber:1,
		date: sequelize.fn("NOW"),
		isActive:true
	});
	
	Admission.create({
		admissionID:2,
		patientID:6,
		doctorID:10,
		roomNumber:2,
		date: sequelize.fn("NOW"),
		isActive:true
	});
	


// RESET RELATIONS
Appointment.belongsTo(Patient, {foreignKey: "patientID", targetKey: "userID"},{onUpdate: "NO ACTION"});
Appointment.belongsTo(Doctor, {foreignKey: "doctorID",targetKey: "userID"},{onUpdate: "NO ACTION"});
Appointment.belongsTo(Counselor, {foreignKey: "counselorID", targetKey: "userID"},{onUpdate: "NO ACTION"});

Admission.belongsTo(Patient, {foreignKey:"patientID", targetKey: "userID"},{onUpdate: "NO ACTION"});
Admission.belongsTo(Doctor, {foreignKey: "doctorID",targetKey: "userID"},{onUpdate: "NO ACTION"});
Admission.belongsTo(Room, {foreignKey: "roomNumber",targetKey: "roomNumber"},{onUpdate: "NO ACTION"});

Prescription.belongsTo(Patient, {foreignKey:"patientID", targetKey: "userID"},{onUpdate: "NO ACTION"});
Prescription.belongsTo(Doctor, {foreignKey:"doctorID", targetKey: "userID"},{onUpdate: "NO ACTION"});
Prescription.belongsTo(Medicine, {foreignKey:"medicineID", targetKey: "medicineID"},{onUpdate: "NO ACTION"});
Prescription.belongsTo(Pharmacist, {foreignKey:"pharmacistID", targetKey: "userID"},{onUpdate: "NO ACTION"}); */


var models = [User, Doctor, Patient, Receptionist, Counselor, Pharmacist, Appointment, Room, Admission, Prescription, Medicine, Documents];
return models;
};