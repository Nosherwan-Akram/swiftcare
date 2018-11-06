var express = require("express");
var router = express.Router();
var models = require("../app.js");
var middleware = require("../middleware");



router.get("/prescriptions", middleware.isLoggedIn, middleware.isPharmacist, function (req, res) {
	models.Prescription.findAll({
			where: {
				served: false
			}, include: [{
				model: models.Medicine,
			}]
		})
		.then(function (prescriptions) {
			res.render("Pharmacist/prescriptions", {
				user: req.user,
				prescriptions: prescriptions
			});
		})
});

router.patch("/prescriptions/:id", middleware.isLoggedIn, middleware.isPharmacist, function (req, res) {

	models.Prescription.findOne({
			where: {
				prescriptionID: req.params.id
			}
		})
		.then(function (prescription) {
			models.Medicine.findOne({
					where: {
						medicineID: prescription.dataValues.medicineID
					}
				})
				.then(function (medicine) {
					if (medicine.dataValues.quantity >= prescription.dataValues.quantity) {
						models.Prescription.update({
								served: true
							}, {
								where: {
									prescriptionID: prescription.dataValues.prescriptionID
								}
							})
							.then(function (status) {
								console.log("Prescription updated.")
								models.Medicine.update({
										quantity: medicine.quantity - prescription.quantity
									}, {
										where: {
											medicineID: medicine.dataValues.medicineID
										}
									})
									.then(function (stat) {
										console.log("Medicine Updated");
										res.redirect("/pharmacists/prescriptions")
									})
							})

					} else {
						res.send("Not enough medicines in stock.");
					}
				})
		});
});


router.get("/medicines", function (req, res) {
	models.Medicine.findAll({
			where: {}
		})
		.then(function (medicines) {
			res.render("Pharmacist/medicinesIndex", {
				medicines: medicines
			})
		})
});

router.post("/medicines", middleware.isLoggedIn, middleware.isPharmacist, function (req, res) {
	models.Medicine.create({
			name: req.body.name,
			description: req.body.description,
			cost: parseInt(req.body.cost),
			quantity: parseInt(req.body.quantity)
		})
		.then(function (medicine) {
			res.redirect("/pharmacists/medicines");
		})
});

router.delete("/medicines/:id", middleware.isLoggedIn, middleware.isPharmacist, function (req, res) {
	models.Medicine.destroy({
			where: {
				medicineID: req.params.id
			}
		})
		.then(function () {
			res.redirect("/pharmacists/medicines");
		})
});

router.get("/medicines/:id/edit", middleware.isLoggedIn, middleware.isPharmacist, function (req, res) {
	models.Medicine.findOne({
			where: {
				medicineID: req.params.id
			}
		})
		.then(function (medicine) {
			res.render("Pharmacist/medicineEdit", {
				medicine: medicine
			})
		});
});

router.patch("/medicines/:id", middleware.isLoggedIn, middleware.isPharmacist, function (req, res) {
	models.Medicine.update({
			name: req.body.name,
			description: req.body.description,
			quantity: parseInt(req.body.quantity),
			cost: parseInt(req.body.cost)

		}, {
			where: {
				medicineID: req.params.id
			}
		})
		.then(function (status) {
			console.log("Medicine Updated.")
			res.redirect("/pharmacists/medicines");
		})
});

router.get("/medicines/new", middleware.isLoggedIn, middleware.isPharmacist, function (req, res) {
	res.render("Pharmacist/medicineNew")
});
module.exports = router;