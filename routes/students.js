var express = require('express');
var router = express.Router();

Class = require('../models/class');
Student = require('../models/student');
User = require('../models/user');
Lesson = require('../models/lesson');

//Get student's classes
router.get('/classes', ensureAuthenticated, function(req, res, next) {
	Student.getStudentByEmail(req.user.email, function(err, student){
		if (err){
			console.log(err);
			throw err;
		} else {
			console.log('Student found.');
			res.render('students/index', {"student": student});
		}
	});
});

//Register student for a class
router.post('/classes/:id/new', ensureAuthenticated, function(req, res){
	classInfo = [];
	classInfo['student_email'] = req.user.email; 
	classInfo['class_id'] = req.params.id;

	//Check if the student is already registered for the class.
	Student.searchForClass(classInfo, function(err, foundClass){
		if (foundClass){
			req.flash('message-drop', "You are already registered for this class.");
			res.redirect('/students/classes');
		} else {
			Student.registerForClass(classInfo, function(err, student){
				if (err) {
					throw err;
				} else {
					req.flash('message-register', "Registered successfully.");
					res.redirect('/students/classes');
				}
			});
		}
	});
});

//Drop registered class
router.post('/classes/:id/delete', ensureAuthenticated, function(req, res){
	classInfo = [];
	classInfo['student_email'] = req.user.email;
	classInfo['class_id'] = req.params.id;

	Student.dropClass(classInfo, function(err, instructor){
		if (err) {
			console.log(err);
			throw err;
		} else {
			console.log("Dropped class.");
			req.flash('message-drop', "Class dropped successfully.");
			res.redirect('/students/classes');
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