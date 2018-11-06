// Standard initialization and imports
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var passport = require("passport");
var localStrategy = require("passport-local");
var methodOverride = require("method-override");
app.use(methodOverride("_method"));
const fileUpload = require('express-fileupload');
app.use(fileUpload());
var expressSession = require("express-session")({

	secret: "This is my secret",
	resave: false,
	saveUninitialized: false
});
// authorization middleware
middleware = require("./middleware");
app.use(express.static(__dirname + "/public"));

function passUser(req, res, next) {
	res.locals.currentUser = req.user;
	next();
}


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

var receptionistRoutes = require("./routes/receptionist.js");
var indexRoutes = require("./routes/index.js");
var patientRoutes = require("./routes/patients.js");
var doctorRoutes = require("./routes/doctors.js");
var counselorRoutes = require("./routes/counselor.js");
var pharmacistRoutes = require("./routes/pharmacist.js");
var userRoutes = require("./routes/users.js");


app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());


console.log("==================================");
console.log(process.env);
console.log("==================================");

// Creating sequelize object and syncing with database
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_NAME,  process.env.DATABASE_USERNAME,process.env.DATABASE_PASSWORD, {
	host: 'sql12.freemysqlhosting.net',
	dialect: 'mysql',

	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	operatorsAliases: false
});
sequelize.dialect.supports.schemas = true;

var models = require('./models.js')(Sequelize, sequelize);

var User = models[0];
var Doctor = models[1];
var Patient = models[2];
var Receptionist = models[3];
var Counselor = models[4];
var Pharmacist = models[5];
var Appointment = models[6];
var Room = models[7];
var Admission = models[8];
var Prescription = models[9];
var Medicine = models [10];
var Documents = models[11];

// For exporting data models to other files
module.exports.User = User;
module.exports.Doctor = Doctor;
module.exports.Patient = Patient;
module.exports.Receptionist = Receptionist;
module.exports.Counselor = Counselor;
module.exports.Pharmacist = Pharmacist;
module.exports.Appointment = Appointment;
module.exports.Room = Room;
module.exports.Admission = Admission;
module.exports.Prescription = Prescription;
module.exports.Medicine = Medicine;
module.exports.Documents = Documents;

sequelize.sync();

require('./passport.js')(passport, User, Doctor, Patient, Counselor, Pharmacist, Receptionist); // import auth strategies


passport.serializeUser(function (user, done) {

	done(null, user.userID);

});

passport.deserializeUser(function (id, done) {

	User.findById(id).then(function (user) {

		if (user) {

			done(null, user.get());

		} else {

			done(user.errors, null);

		}

	});

});

app.use(passUser);

app.use("/", indexRoutes);
app.use("/receptionist", receptionistRoutes);
app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
app.use("/counselors", counselorRoutes);
app.use("/pharmacists", pharmacistRoutes);
app.use("/users", userRoutes);




const PORT = process.env.PORT || 3000;

app.listen(PORT);