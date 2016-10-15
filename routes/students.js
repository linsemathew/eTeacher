var express = require('express');
var router = express.Router();

Class = require('../models/class');
Student = require('../models/student');
User = require('../models/user');

//Get Student's classes
router.get('/classes', ensureAuthenticated, function(req, res, next) {
	Student.getStudentByEmail(req.user.email, function(err, student){
		if (err){
			res.send(error);
		} else {
			res.render('students/classes', {"student": student})
		}
	});
});

//Register Students for a class
router.post('/classes/register', function(req, res){
	classInfo = [];
	classInfo['student_email'] = req.user.email; 
	classInfo['class_id'] = req.body.class_id;
	classInfo['class_title'] = req.body.class_title;
	classInfo['class_instructor'] = req.body.class_instructor;

	Student.registerForClass(classInfo, function(err, student){
		if (err) throw err
	});

	res.redirect('/classes')
});

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login');
    }
};

module.exports = router;