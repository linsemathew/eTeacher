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

module.exports = router;

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next;
    } else {
        res.redirect('/users/login');
    }
};