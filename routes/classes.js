var express = require('express');
var router = express.Router();
Class = require('../models/class')
Instructor = require('../models/instructor');
Lesson = require('../models/lesson');

router.get('/', function(req, res, next) {
	Class.getClasses(function(err, classes){
		if (err){
			console.log(err)
			throw err
		} else {
			res.render('classes/index', {"classes": classes})
		}
	});
});

// Get a new class form
router.get('/newclass', function(req, res, next) {
	var user = req.user.type
	if (user && user == 'instructor'){
		res.render('classes/newclass');
	} else {
		res.redirect('/')
	}
});

// Create a new class 
router.post('/newclass', function(req, res){

	var instructor_id   = req.user._id
	var instructorEmail = req.user.email;
    var first_name      = req.user.first_name;
    var last_name       = req.user.last_name;
    var title           = req.body.title;
    var description     = req.body.description;
    var category        = req.body.category;

	req.checkBody('title', 'Title is required.').notEmpty();
    req.checkBody('title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('description', 'Description is required.').notEmpty();
    req.checkBody('description', 'Please enter a shorter description.').len(0, 100);

    var errors = req.validationErrors();

    if(errors){
        res.render('classes/newclass', {
            errors: errors,
            title: title,
            description: description,
        });
    } else {

        var newClass = {
            title: title,
            description: description,
            instructor: first_name + " " + last_name,
            instructor_email: instructorEmail,
            category: category
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

//View details for a single class
router.get('/:id/details', function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, name){
		if (err){
			console.log(err)
			throw err
		} else {
			console.log(name)
			res.render('classes/details', {"class": name})
		}
	});
});

//Get form to update a class
router.get('/:id/edit', ensureAuthenticated, function(req, res, next) {

	Class.getClassesById([req.params.id], function(err, foundClass){
		if (err){
			throw err
		} else {
			res.render('classes/editclass', {title: foundClass.title, description: foundClass.description, class_id: foundClass._id})
		}
	})
})

//Update a class
router.post('/:id/edit', function(req, res, next){

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
    	res.render('classes/editclass', {
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

//View all lessons for a class
router.get('/:id/lessons', function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, classLesson){
		if (err){
			console.log(err)
			throw err
		} else {
			if(req.user && classLesson.instructor_email == req.user.email){
				var instructor = true
			}
			console.log(classLesson)
			res.render('classes/lessons', {"class": classLesson, "instructor": instructor})
		}
	});
});

//Get new lesson form
router.get('/:id/lessons/new', ensureAuthenticated, function(req, res, next) {

	Class.getClassesById([req.params.id], function(err, name){
		if (err){
			console.log(err)
			throw err
		} else {
			res.render('classes/newlesson', {class_id: req.params.id})
		}
	}) 
});

//Add a new lesson
router.post('/:id/lessons/new', ensureAuthenticated, function(req, res, next) {

	var instructor_email  = req.user.email;
	var class_id          = req.params.id;
	var lesson_title      = req.body.lesson_title;
	var lesson_body       = req.body.lesson_body;
	var creator_class     = req.params.id

	req.checkBody('lesson_title', 'Title is required.').notEmpty();
    req.checkBody('lesson_title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('lesson_body', 'Lesson body is required.').notEmpty();
    req.checkBody('lesson_body', 'Please enter a shorter lesson.').len(0, 2000);

    var errors = req.validationErrors();

    if(errors){
        res.render('classes/newlesson', {
            errors: errors,
            class_id: class_id,
            lesson_title: lesson_title,
            lesson_body: lesson_body
        })
    } else {

    	var newLesson = {
            instructor_email: instructor_email,
            lesson_title: lesson_title,
            lesson_body: lesson_body,
            creator_class: creator_class
        };
        
        Lesson.saveLesson(newLesson, function(err, lesson){
        	if (err){
        		console.log(err)
        		throw err
        	} else {
        		console.log('Lesson saved.')
        		//Add a lesson to classes
				Class.addLessonToClass(class_id, lesson, function(err, foundClass){
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
	}
})

//Get update lesson form
router.get('/:id/lessons/:lesson_id/edit', ensureAuthenticated, function(req, res, next) {

	Lesson.getLessonById([req.params.lesson_id], function(err, foundLesson){
		if (err){
			console.log(err)
			throw err
		} else {
			res.render('classes/editlesson', {
				class_id: req.params.id, 
				lesson_id: req.params.lesson_id, 
				lesson_title: foundLesson.lesson_title, 
				lesson_body: foundLesson.lesson_body
			})
		}
	}) 
});

//Update a lesson
router.post('/:id/lessons/:lesson_id/edit', function(req, res, next){

	var lessonUpdates                = []; 
	lessonUpdates['title']           = req.body.lesson_title;
    lessonUpdates['body']            = req.body.lesson_body;

   	req.checkBody('lesson_title', 'Title is required.').notEmpty();
    req.checkBody('lesson_title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('lesson_body', 'Lesson body is required.').notEmpty();
    req.checkBody('lesson_body', 'Please enter a shorter lesson.').len(0, 400);

    var errors = req.validationErrors(); 

    console.log(lessonUpdates)

    if (errors){
    	res.render('classes/editlesson', {
            errors: errors,
            lesson_id: req.params.lesson_id, 
            class_id: req.params.id,
            lesson_title: lessonUpdates['title'],
            lesson_body: lessonUpdates['body']
        })
    } else {
		Lesson.updateLesson([req.params.lesson_id], lessonUpdates, function(err, updatedLesson){
			if(err){
				console.log(err)
				throw err;
			} else {
				console.log('Lesson updated.');
				res.redirect('/classes/' + req.params.id + '/lessons');
			}
		})
	}
})

//Delete a lesson
router.post('/:id/lessons/:lesson_id/delete', function(req, res, next){
	Lesson.deleteLesson(req.params.lesson_id, function(err, callback){
		if (err){
			console.log(err);
			throw err
		} else {
			console.log('Lesson deleted.')
			//Delete a lesson from classes.
			Class.deleteLessonFromClass(req.params.lesson_id, req.params.id, function(err, callback){
				if (err){
					console.log(err);
					throw err
				} else {
					console.log('Lesson removed from classes.')
					res.redirect('/instructors/classes')
				}
			})
		}
	})
})

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login')
    }
}

module.exports = router;