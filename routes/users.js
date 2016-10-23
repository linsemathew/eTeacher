var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Student = require('../models/student');
var Instructor= require('../models/instructor');

//Get signup form
router.get('/new', function(req, res, next) {
    if (!req.user){
        res.render('users/new');
    } else {
        res.redirect('/classes');
    } 
});

//Register a new user
router.post('/new', function(req, res, next){

    var first_name      = req.body.first_name;
    var last_name       = req.body.last_name;
    var email           = req.body.email;
    var password        = req.body.password;
    var password2       = req.body.password2;
    var type            = req.body.type;
    var student
    var instructor

    req.checkBody('type', 'Account type is required.').notEmpty();
    req.checkBody('first_name', 'First name is required.').notEmpty();
    req.checkBody('first_name', 'Please enter a shorter first name.').len(0, 40);
    req.checkBody('last_name', 'Last name is required.').notEmpty();
    req.checkBody('last_name', 'Please enter a shorter last name.').len(0, 40);
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Email must be valid.').isEmail();
    req.checkBody('email', 'Please enter a shorter email.').len(0, 40);
    req.checkBody('password', 'Password is required.').notEmpty();
    req.checkBody('password2', 'Passwords must match.').equals(req.body.password);
    req.checkBody('password', 'Please choose a password between 6 to 50 characters.').len(6, 50);

    if (type == 'student'){
        student = 'checked'
    } else if (type == 'instructor') {
        instructor = 'checked'
    }

    var errors = req.validationErrors();
    console.log(errors)
    if(errors){
        res.render('users/new', {
            errors: errors,
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password,
            password2: password2,
            student: student,
            instructor: instructor
        });
    } else {

        User.getUserByEmail(email, function(err, user){
            if (user){
                res.render('users/new', {
                    errors: [ { 
                        msg: 'Email already registered.',
                    } ],
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: password,
                    password2: password2,
                    student: student,
                    instructor: instructor
                });
            } else {

                var newUser = new User({
                    first_name: first_name,
                    last_name: last_name,
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

                //Save as student
                if(type == 'student'){
                    User.saveStudent(newUser, newStudent, function(err, user){
                        console.log('Student saved');
                        req.login(newUser, function(err) {
                            if (err) {
                                console.log(err);
                            }
                        })
                        res.redirect('/' +type+ 's/classes');
                    })
                } else {
                    //Save as instructor
                    User.saveInstructor(newUser, newInstructor, function(err, user){
                        console.log('Instructor saved');
                        req.login(newUser, function(err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                        res.redirect('/' +type+ 's/classes');
                    })
                }
            }
        })
    }
});

router.get('/login', function(req, res, next){
    if (!req.user){
        res.render('users/login');
    } else {
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


router.post('/login',passport.authenticate('local-login', {
    failureRedirect:'/users/login', 
    failureFlash: "Incorrect email or password."
}), function(req, res){
    var userType = req.user.type;
    res.redirect('/' +userType+ 's/classes');
});


//Check credentials for login
passport.use('local-login', new LocalStrategy({
    usernameField: 'email'
    },
    function(email, password, done) {

        User.getUserByEmail(email, function(err, user){
            if (err) throw err;
            if(!user){ 
                return done(null, false);
            }

            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) return done(err);
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        });
    }
));

//Logout user
router.get('/logout', function(req, res){
    req.session.destroy(function (err) {
        console.log(err);
        res.redirect('/');
    });
});

//Protect routes against users that aren't logged in.
function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next;
    } else {
        res.redirect('/users/login');
    }
};

module.exports = router;