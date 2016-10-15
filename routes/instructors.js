var express = require('express');
var router = express.Router();

Class = require('../models/class');
Instructor = require('../models/instructor');
User = require('../models/user');

//Get Instructor's classes
router.get('/classes', ensureAuthenticated, function(req, res, next) {
	Instructor.getInstructorByEmail(req.user.email, function(err, instructor){
		if (err){
			console.log(err);
			res.send(error);
		} else {
			res.render('instructors/classes', {"instructor": instructor})
		}
	});
});

//Register Instructor as a student for a class
router.post('/classes/register', function(req, res){
	classInfo = [];
	classInfo['instructor_email'] = req.user.email; 
	classInfo['class_id'] = req.body.class_id;
	classInfo['class_title'] = req.body.class_title;
	classInfo['class_instructor'] = req.body.class_instructor;

	Instructor.registerForClass(classInfo, function(err, instructor){
		if (err) throw err
	});

	res.redirect('/instructors/classes')
});

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login');
    }
};

module.exports = router;