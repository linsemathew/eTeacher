var express = require('express');
var router = express.Router();

Class = require('../models/class');
Instructor = require('../models/instructor');
Lesson = require('../models/lesson');
Category = require('../models/category');

//Get all classes
router.get('/', function(req, res, next) {
	Class.getClasses(function(err, classes){
		if (err){
			console.log(err);
			throw err;
		} else {
			console.log('Found all classes.');
			res.render('classes/index', {"classes": classes});
		}
	});
});

// Get the form for a new class
router.get('/new', ensureAuthenticated, function(req, res, next) {
	var user = req.user.type;

	if (user == 'instructor'){
		Category.getCategories(function(err, categories){
			if (err){
				console.log(err);
				throw err;
			} else {
				console.log('Found all categories for new class form.');
				res.render('classes/new', {categories: categories});
			}
		});
	} else {
		res.redirect('/');
	}
});

// Create a new class 
router.post('/', ensureAuthenticated, function(req, res){

	var instructor_id   = req.user._id;
	var instructorEmail = req.user.email;
    var first_name = req.user.first_name;
    var last_name = req.user.last_name;
    var title = req.body.title;
    var description = req.body.description;
    var category = req.body.category;
    var user = req.user;

	req.checkBody('title', 'Title is required.').notEmpty();
    req.checkBody('title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('description', 'Description is required.').notEmpty();
    req.checkBody('description', 'Please enter a shorter description.').len(0, 300);

    var errors = req.validationErrors();

    if(errors){
    	Category.getCategories(function(err, categories){
			if (err){
				console.log(err);
				throw err;
			} else {
				res.render('classes/new', {
		        	user: user,
		            errors: errors,
		            title: title,
		            description: description,
		            categories: categories
				});
			}
		});
    } else {

        var newClass = {
            title: title,
            description: description,
            instructor: first_name + " " + last_name,
            instructor_email: instructorEmail,
            category: category
        };

        //Save a new class
        Class.createNewClass(newClass, function(err, addedClass){
        	if (err){
				console.log(err);
				throw err;
			} else {
				console.log("Class added.");
				//Add the class to the classes that the instructor is teaching
				Instructor.addClassToTeachingClasses(addedClass, instructorEmail, function(err, instructor){
					if (err) throw err
				});
				req.flash('message-add', addedClass.title + " added successfully.");
				res.redirect('/instructors/classes');
			}
        })
    }
});

//View details for a single class
router.get('/:id', function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, foundClass){
		if (err){
			console.log(err)
			throw err
		} else {
			console.log('Found class.')
			res.render('classes/show', {"class": foundClass})
		}
	});
});

//Get form to update a class
router.get('/:id/edit', ensureAuthenticated, function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, foundClass){
		if (err){
			throw err
		} else {
			if (req.user.email == foundClass.instructor_email){
				res.render('classes/edit', {title: foundClass.title, description: foundClass.description, class_id: foundClass._id})
			} else {
				res.redirect('/');
			}
		}
	})
})

//Update a class
router.post('/:id/edit', ensureAuthenticated, function(req, res, next){

	var classUpdates = []; 
	classUpdates['title'] = req.body.title;
    classUpdates['description'] = req.body.description;
    classUpdates['classId'] = req.params.id;
    classUpdates['user'] = req.user

   	req.checkBody('title', 'Title is required.').notEmpty();
    req.checkBody('title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('description', 'Description is required.').notEmpty();
    req.checkBody('description', 'Please enter a shorter description.').len(0, 300);

    var errors = req.validationErrors(); 

    if (errors){
    	res.render('classes/edit', {
    		errors: errors,
    		user: classUpdates['user'],
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
				req.flash('message-edit', classUpdates.title + " updated successfully.");
				res.redirect('/instructors/classes');
			}
		})
	}
})

//Delete a class
router.post('/:id/delete', ensureAuthenticated, function(req, res, next){

	var instructor_id = req.user._id

	Class.deleteClass(req.params.id, function(err, deletedClass){
		if (err){
			console.log(err);
			throw err
		} else {
			instructor_email = deletedClass.instructor_email;
			deleted_class_id = deletedClass._id;

			console.log('Class deleted.')
			//Delete a lesson from classes.
			Lesson.deleteLessonsFromDeletedClass(deleted_class_id, function(err, callback){
				if (err){
					console.log(err);
					throw err
				} else {
					console.log('Lessons from the deleted class are removed.');
					//Remove class from the classes the instructor is teaching.
					Instructor.removeClassInstructorFor(instructor_email, deleted_class_id, function(err, callback){
						if (err){
							console.log(err);
							throw err;
						} else {
							console.log('Class deleted from classes instructor for.');
							//Remove class from registered students.
							Student.removeDeletedClass(deleted_class_id, function(err, callback){
								if (err){
									console.log(err);
									throw err;	
								} else {
									console.log('Class deleted from students.');
									//Remove class from registered instructors.
									Instructor.removeDeletedClass(deleted_class_id, function(err, callback){
										if (err){
											console.log(err);
											throw err;	
										} else {
											console.log("Class deleted from Instructors that registered for it.")
											req.flash('message-drop', deletedClass.title + " deleted successfully.");
											res.redirect('/instructors/classes')
										}
									})
								}
							})
						}
					})
				}
			})
		}
	})
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
			console.log('Lessons found.')
			res.render('lessons/index', {"class": classLesson, "instructor": instructor})
		}
	});
});

//Get new lesson form
router.get('/:id/lessons/new', ensureAuthenticated, function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, foundClass){
		if (err){
			console.log(err)
			throw err
		} else {
			if (req.user && req.user.email == foundClass.instructor_email){
				res.render('lessons/new', {class_id: req.params.id})
			} else {
				res.redirect('/');
			}
		}
	}) 
});

//Add a new lesson
router.post('/:id/lessons', ensureAuthenticated, function(req, res, next) {

	var instructor_email = req.user.email;
	var class_id = req.params.id;
	var lesson_title = req.body.lesson_title;
	var lesson_body = req.body.lesson_body;
	var creator_class = req.params.id;
	var user = req.user;

	req.checkBody('lesson_title', 'Title is required.').notEmpty();
    req.checkBody('lesson_title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('lesson_body', 'Lesson body is required.').notEmpty();
    req.checkBody('lesson_body', 'Please enter a shorter lesson.').len(0, 2000);

    var errors = req.validationErrors();

    if(errors){
        res.render('lessons/new', {
        	user: user,
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
        
        Lesson.saveLesson(newLesson, function(err, addedLesson){
        	if (err){
        		console.log(err)
        		throw err
        	} else {
        		console.log('Lesson saved.')
        		//Add a lesson to classes
				Class.addLessonToClass(class_id, addedLesson._id, function(err, foundClass){
					if(err){
						console.log(err)
						throw err
					} else {		
						console.log('Lesson added.')
						req.flash('message-add', addedLesson.lesson_title + " added to " + foundClass.title + " successfully.");
						res.redirect('/classes/'+ req.params.id +'/lessons')
					}
				})
        	}
        })
	}
})

//Display a single lesson
router.get('/:id/lessons/:lesson_id', function(req, res, next) {
	Lesson.getLessonById([req.params.lesson_id], function(err, lesson){
		if (err){
			console.log(err)
			throw err
		} else {
			console.log('Lesson found.')
			res.render('lessons/show', {"lesson": lesson})
		}
	});
});

//Get edit lesson form
router.get('/:id/lessons/:lesson_id/edit', ensureAuthenticated, function(req, res, next) {

	var class_id = req.params.id;
	var lesson_id = req.params.lesson_id;
	var user = req.user

	Lesson.getLessonById(lesson_id, function(err, foundLesson){
		if (err){
			console.log(err)
			throw err
		} else {
			if (req.user && req.user.email == foundLesson.instructor_email){
				res.render('lessons/edit', {
					user: user,
					class_id: class_id, 
					lesson_id: lesson_id, 
					lesson_title: foundLesson.lesson_title, 
					lesson_body: foundLesson.lesson_body
				})
			} else {
				res.redirect('/')
			}
		}
	}) 
});

//Update a lesson
router.post('/:id/lessons/:lesson_id/edit', ensureAuthenticated, function(req, res, next){

	var lessonUpdates = []; 
	lessonUpdates['title'] = req.body.lesson_title;
    lessonUpdates['body'] = req.body.lesson_body;
    var user = req.user;
    var lesson_id = req.params.lesson_id;
    var class_id = req.params.id

   	req.checkBody('lesson_title', 'Title is required.').notEmpty();
    req.checkBody('lesson_title', 'Please enter a shorter title.').len(0, 40);
    req.checkBody('lesson_body', 'Lesson body is required.').notEmpty();
    req.checkBody('lesson_body', 'Please enter a shorter lesson.').len(0, 2000);

    var errors = req.validationErrors(); 

    if (errors){
    	res.render('lessons/edit', {
    		user: user,
            errors: errors,
            lesson_id: lesson_id,
            class_id: class_id,
            lesson_title: lessonUpdates['title'],
            lesson_body: lessonUpdates['body']
        })
    } else {
		Lesson.updateLesson(lesson_id, lessonUpdates, function(err, updatedLesson){
			if(err){
				console.log(err)
				throw err;
			} else {
				console.log('Lesson updated.');
				req.flash('message-edit', updatedLesson.lesson_title + " updated successfully.");
				res.redirect('/classes/' + class_id + '/lessons');
			}
		})
	}
})

//Delete a lesson
router.post('/:id/lessons/:lesson_id/delete', ensureAuthenticated, function(req, res, next){

	var lesson = [];
	lesson['lesson_id'] = req.params.lesson_id;
	lesson['class_id'] = req.params.id;
	var instructor_id = req.user._id;
	
	Lesson.deleteLesson(lesson, function(err, lesson){
		if (err){
			console.log(err);
			throw err
		} else {
			console.log('Lesson deleted.')
			//Delete the lesson from classes.
			Class.deleteLessonFromClass(lesson, function(err, deletedLessonFromClass){
				if (err){
					console.log(err);
					throw err
				} else {
					console.log('Lesson deleted from class.')
					req.flash('message-drop', lesson.lesson_title + " deleted successfully.");
					res.redirect('/classes/' + lesson.creator_class + '/lessons')
				}
			})
		}
	})
})

//Protect routes against users that aren't logged in.
function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login')
    }
}

module.exports = router;