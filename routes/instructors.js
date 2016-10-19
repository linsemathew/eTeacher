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
			throw err;
		} else {
			console.log(instructor)
			res.render('instructors/classes', {"instructor": instructor})
		}
	});
});

// Create a new class form
router.get('/classes/newclass', function(req, res, next) {
	var user = req.user.type
	if (user == 'instructor'){
		res.render('instructors/newclass');
	} else {
		res.redirect('/')
	}
});

// Create a new class 
router.post('/classes/newclass', function(req, res){

	var instructor_id   = req.user._id
	var instructorEmail = req.user.email;
    var first_name      = req.user.first_name;
    var last_name       = req.user.last_name;
    var title           = req.body.title;
    var description     = req.body.description;

	req.checkBody('title', 'Title is required.').notEmpty();
    req.checkBody('title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('description', 'Description is required.').notEmpty();
    req.checkBody('description', 'Please enter a shorter description.').len(0, 100);

    var errors = req.validationErrors();

    if(errors){
        res.render('instructors/newclass', {
            errors: errors,
            title: title,
            description: description,
        });
    } else {

        var newClass = {
            title: title,
            description: description,
            instructor: first_name + " " + last_name,
            instructor_id: instructor_id
        };

        //Save class
        Class.createNewClass(newClass, function(err, addedClass){
        	if (err){
				console.log(err);
				throw err;
			} else {
				console.log("Class added.")
				//Add the class to the classes that the instructor is teaching
				console.log(addedClass)
				Instructor.addClassToTeachingClasses(addedClass, instructorEmail,function(err, instructor){
					if (err) throw err
				});
				res.redirect('/instructors/classes');
			}
        })
    }
});

//Register Instructor as a student for a class
router.post('/classes/register', function(req, res){
	classInfo = [];
	classInfo['instructor_email'] = req.user.email; 
	classInfo['class_id'] = req.body.class_id;

	Instructor.registerForClass(classInfo, function(err, instructor){
		if (err) {
			console.log(err)
			throw err;
		} else {
			console.log("Successfully registered")
			res.redirect('/instructors/classes');
		}
	});
});

//Get new lesson form
router.get('/classes/:id/lessons/new', ensureAuthenticated, function(req, res, next) {
	if (req.user.type = 'instructor'){
		Class.getClassesById([req.params.id], function(err, name){
			if (err){
				console.log(err)
				throw err
			} else {
				if (name._instructor_id = req.user._id){
					res.render('instructors/newlesson', {"class_id": req.params.id})
				} else {
					res.redirect('/')
				}
			}
		}) 
	} else {
		res.redirect('/');
	}
});

//Add a new lesson
router.post('/classes/:id/lessons/new', ensureAuthenticated, function(req, res, next) {

	var lesson = [];
	var instructorEmail = req.user.email;
	lesson['class_id'] = req.params.id;
	lesson['lesson_title'] = req.body.lesson_title;
	lesson['lesson_body'] = req.body.lesson_body;

	req.checkBody('lesson_title', 'Title is required.').notEmpty();
    req.checkBody('lesson_title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('lesson_body', 'Lesson body is required.').notEmpty();
    req.checkBody('lesson_body', 'Please enter a shorter lesson.').len(0, 2000);

    var errors = req.validationErrors();

    if(errors){
        res.render('instructors/newlesson', {
            errors: errors,
            class_id: lesson['class_id'],
            lesson_title: lesson['lesson_title'],
            lesson_body: lesson['lesson_body']
        })
    } else {
    	//Add a lesson to classes
		Class.addLesson(lesson, function(err, lesson){
			if(err){
				console.log(err)
				throw err
			} else {		
				console.log('Lesson added.')
				res.redirect('/classes/'+ req.params.id +'/lessons')
			}
		})
	}
})

//Get form to update a class
router.get('/classes/:id/edit', ensureAuthenticated, function(req, res, next) {

	Class.getClassesById([req.params.id], function(err, foundClass){
		if (err){
			throw err
		} else {
			res.render('instructors/editclass', {title: foundClass.title, description: foundClass.description, class_id: foundClass._id})
		}
	})
})

//Update a class
router.post('/classes/:id/edit', function(req, res, next){

	var classUpdates                = []; 
	classUpdates['title']           = req.body.title;
    classUpdates['description']     = req.body.description;

   	req.checkBody('title', 'Title is required.').notEmpty();
    req.checkBody('title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('description', 'Description is required.').notEmpty();
    req.checkBody('description', 'Please enter a shorter description.').len(0, 100);

    var errors = req.validationErrors(); 
    console.log(classUpdates)
    if (errors){
    	res.render('instructors/editclass', {
            errors: errors,
            class_id: classUpdates['classId'],
            title: classUpdates['title'],
            description: classUpdates['description']
        })
    } else {
		Class.updateClass([req.params.id], classUpdates, function(err, updatedClass){
			if(err){
				console.log(err)
				throw err;
			} else {
				console.log('Class updated.');
				res.redirect('/instructors/classes');
			}
		})
	}
})

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login')
    }
}

module.exports = router