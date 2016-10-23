var express = require('express');
var router = express.Router();

Class = require('../models/class');
User = require('../models/user');
Lesson = require('../models/lesson');

//Get Instructor's classes
router.get('/classes', ensureAuthenticated, function(req, res, next) {
	Instructor.getInstructorByEmail(req.user.email, function(err, instructor){
		if (err){
			console.log(err);
			throw err;
		} else {
			res.render('instructors/index', {"instructor": instructor})
		}
	});
});


//Register Instructor as a student for a class
router.post('/classes/:id/new', function(req, res){
	classInfo 						= [];
	classInfo['instructor_email']   = req.user.email; 
	classInfo['class_id'] 			= req.params.id;

	Instructor.searchForClass(classInfo, function(err, foundClass){
		if (foundClass){
			req.flash('message-drop', "You are already registered for this class.")
			res.redirect('/instructors/classes')
		} else {
			Instructor.registerForClass(classInfo, function(err, instructor){
				if (err) {
					console.log(err)
					throw err;
				} else {
					console.log("Successfully registered");
					req.flash('message-register', "Registered successfully.");
					res.redirect('/instructors/classes');
				}
			})
		}
	})
});

//Drop registered class
router.post('/classes/:id/delete', function(req, res){

	classInfo 							= [];
	classInfo['instructor_email']   	= req.user.email;
	classInfo['class_id'] 				= req.params.id;
	var instructor_id 					= req.user._id;

	Instructor.dropClass(classInfo, function(err, instructor){
		if (err) {
			console.log(err)
			throw err;
		} else {
			console.log("Dropped class.")
			req.flash('message-drop', "Class dropped successfully.");
			res.redirect('/instructors/classes');
		}
	});
});


function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login')
    }
}

module.exports = router