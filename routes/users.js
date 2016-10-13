var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Student = require('../models/student');
var Instructor= require('../models/instructor');

router.get('/signup', function(req, res, next) {
  res.render('users/signup');
});

router.post('/signup', function(req, res, next){

	var first_name     	= req.body.first_name;
	var last_name     	= req.body.last_name;
	var email    		= req.body.email;
	var password 		= req.body.password;
	var password2 		= req.body.password2;
	var type            = req.body.type;

	req.checkBody('first_name', 'First name is required.').notEmpty();
	req.checkBody('first_name', 'Please enter a shorter first name.').len(1, 40);
	req.checkBody('last_name', 'Last name is required.').notEmpty();
	req.checkBody('last_name', 'Please enter a shorter last name.').len(1, 40);
	req.checkBody('email', 'Email is required.').notEmpty();
	req.checkBody('email', 'Email must be valid.').isEmail();
	req.checkBody('email', 'Please enter a shorter email.').len(1, 40);
	req.checkBody('password', 'Password is required.').notEmpty();
	req.checkBody('password2', 'Passwords must match.').equals(req.body.password);
	req.checkBody('password', 'Please choose a password between 6 to 50 characters.').len(6, 50);

	var errors = req.validationErrors();

	if(errors){
		res.render('users/signup', {
    		errors: errors,
    		first_name: first_name,
    		last_name: last_name,
    		email: email,
    		password: password,
    		password2: password2
    	});
	} else {
		var newUser = new User({
			email: email,
			password: password,
			type: type
		});

		var newStudent = new Student({
			first_name: first_name,
			last_name: last_name,
			email: email,
		});

		var newInstructor = new Instructor({
			first_name: first_name,
			last_name: last_name,
			email: email,
		});
		
		if(type == 'student'){
			User.saveStudent(newUser, newStudent, function(err, user){
				console.log('Student saved');
			});
		} else {
			User.saveInstructor(newUser, newInstructor, function(err, user){
				console.log('Instructor saved');
			});
		}

		res.redirect('/classes');
	}
});

module.exports = router;