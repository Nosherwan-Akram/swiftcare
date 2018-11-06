//load bcrypt
var bCrypt = require('bcrypt-nodejs');
 
 
module.exports = function(passport, user, doctor, patient, counselor, pharmacist, receptionist) {
 
 
    var User = user;

    var Doctor = doctor;

    var Patient = patient;

    var Counselor = counselor;

    var Pharmacist = pharmacist;

    var Receptionist = receptionist;
 
    var LocalStrategy = require('passport-local').Strategy;
 
 
    passport.use('local-signup', new LocalStrategy(
 
        {
 
            usernameField: 'email',
 
            passwordField: 'password',
 
            passReqToCallback: true // allows us to pass back the entire request to the callback
 
        },
 
 
 
        function(req, email, password, done) {

            console.log("Running strategy");
 
            var generateHash = function(password) {
 
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
 
            };

            var addSubclass = function(createdUser){
                if (createdUser.userType === "Doctor"){
                    var data = {
                        specialization: "Cancer"}
                   
                    Doctor.create(data).then(function(doctor){
                        
                        createdUser.setDoctor(doctor);
                    })

                }

                else if (createdUser.userType === "Patient"){
                    Patient.create({}).then(function(patient){
                        createdUser.setPatient(patient);
                    })
                }

                else if (createdUser.userType === "Receptionist"){
                    Receptionist.create({}).then(function(receptionist){
                        createdUser.setReceptionist(receptionist);
                    })
                }

                else if (createdUser.userType === "Counselor"){
                    Counselor.create({}).then(function(counselor){
                        createdUser.setCounselor(counselor);
                    })
                }

                else if (createdUser.userType === "Pharmacist"){
                    Pharmacist.create({}).then(function(pharmacist){
                        createdUser.setPharmacist(pharmacist);
                    })
                }


            };


 
 
 
            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {
 
                if (user)
 
                {
 
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
 
                } else
 
                {
 
                    var userPassword = generateHash(password);
 
                    var data =
 
                        {
                            email: email,
 
                            password: userPassword,

                            userType: req.body.userType,
 
                        };
                    
 
                    User.create(data).then(function(newUser, created) {
 
                        if (!newUser) {
 
                            return done(null, false);
 
                        }
 
                        if (newUser) {

                            addSubclass(newUser);
                            return done(null, newUser);
 
                        }
 
                    });
 
                }
 
            });
 
        }
 
    ));

    //LOCAL SIGNIN
passport.use('local-signin', new LocalStrategy(
 
    {
 
        // by default, local strategy uses username and password, we will override with email
 
        usernameField: 'email',
 
        passwordField: 'password',
 
        passReqToCallback: true // allows us to pass back the entire request to the callback
 
    },
 
 
    function(req, email, password, done) {
 
        var User = user;
        email = email.toLowerCase();
        var isValidPassword = function(userpass, password) {
 
            return userpass === password;
 
        }
 
        User.findOne({
            where: {
                email: email
            }
        }).then(function(user) {
 
            if (!user) {
 
                return done(null, false, {
                    message: 'Email does not exist'
                });
 
            }
 
            if (!isValidPassword(user.password, password)) {
 
                return done(null, false, {
                    message: 'Incorrect password.'
                });
 
            }
 
 
            var userinfo = user.get();
            return done(null, userinfo);
 
 
        }).catch(function(err) {
 
            console.log("Error:", err);
 
            return done(null, false, {
                message: 'Something went wrong with your Signin'
            });
 
        });
 
 
    }
 
));
 
}