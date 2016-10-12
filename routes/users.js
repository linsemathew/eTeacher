var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/signup', function(req, res, next) {
	res.render('users/signup');
});

router.post('/signup', function(req, res, next) {
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var type = req.body.type;

	req.checkBody('first_name', 'First name is required.').notEmpty();
	req.checkBody('last_name', 'Last name is required.').notEmpty();
	req.checkBody('email', 'Email field is required.').notEmpty();
	req.checkBody('email', 'Email must be a valid email.').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords must match').equals(req.body.password);
	var errors = req.validationErrors();

	if (errors) {
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
			email : email,
			password : password,
			type : type
		});
		var newStudent = new Student({
			first_name : first_name,
			last_name : last_name,
			email : email,
		});
		var newInstructor = new Instructor({
			first_name : first_name,
			last_name : last_name,
			email : email,
		});
		if (type == 'student'){
			User.saveStudent(newUser, newStudent, function(err, user){
				console.log("Student saved.")
			});
		} else if (type == 'instructor'){
			User.saveInstructor(newUser, newInstructor, function(err, user){
				console.log("Instructor saved.")
			});
		}

		redirect('/')
	}
})

module.exports = router;