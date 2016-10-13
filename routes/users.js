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

router.get('/login', function(req, res, next){
    res.render('users/login')
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

passport.serializeUser(function(user, done) {
	done(null, user._id);
});


passport.deserializeUser(function(id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});


router.post('/login',passport.authenticate('local',{
	failureRedirect:'/users/login', 
    failureFlash:'Wrong Username or Password'
}), function(req, res){
	var usertype = req.user.type;
	res.redirect('/classes');
});


passport.use(new LocalStrategy({
	usernameField: 'email'
	},
	function(email, password, done) {

		User.getUserByEmail(email, function(err, user){
			if (err) throw err;
			if(!user){
				return done(null, false, { message: 'Unregistered email' }); 
			}

			User.comparePassword(password, user.password, function(err, isMatch) {
				if (err) return done(err);
				if(isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
  	}
));

module.exports = router;