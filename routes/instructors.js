var express = require('express');
var router  = express.Router();

Class  = require('../models/class');
User   = require('../models/user');
Lesson = require('../models/lesson');

//Get instructor's classes
router.get('/classes', ensureAuthenticated, function(req, res, next) {
	Instructor.getInstructorByEmail(req.user.email, function(err, instructor){
		if (err){
			console.log(err);
			throw err;
		} else {
			console.log('Instructor found.');
			res.render('instructors/index', {"instructor": instructor});
		}
	});
});

//Register Instructor as a student for a class
router.post('/classes/:id/new', ensureAuthenticated, function(req, res){
	classInfo 						= [];
	classInfo['instructor_email']   = req.user.email; 
	classInfo['class_id'] 			= req.params.id;

	//Check if instructor is already registered for the class.
	Instructor.searchForClass(classInfo, function(err, foundClass){
		if (foundClass){
			req.flash('message-drop', "You are already registered for this class.");
			res.redirect('/instructors/classes');
		} else {
			Instructor.registerForClass(classInfo, function(err, instructor){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log("Successfully registered");
					req.flash('message-register', "Registered successfully.");
					res.redirect('/instructors/classes');
				}
			});
		}
	});
});

//Drop registered class
router.post('/classes/:id/delete', ensureAuthenticated, function(req, res){
	classInfo 							= [];
	classInfo['instructor_email']   	= req.user.email;
	classInfo['class_id'] 				= req.params.id;
	var instructor_id 					= req.user._id;

	Instructor.dropClass(classInfo, function(err, instructor){
		if (err) {
			console.log(err);
			throw err;
		} else {
			console.log("Dropped class.");
			req.flash('message-drop', "Class dropped successfully.");
			res.redirect('/instructors/classes');
		}
	});
});

//Protect routes against users that aren't logged in.
function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login');
    }
};

module.exports = router;