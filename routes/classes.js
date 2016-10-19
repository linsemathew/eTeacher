var express = require('express');
var router = express.Router();
Class = require('../models/class')

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

router.get('/:id/details', function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, name){
		if (err){
			console.log(err)
			throw err
		} else {
			res.render('classes/details', {"class": name})
		}
	});
});

router.get('/:id/lessons', function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, classLesson){
		if (err){
			console.log(err)
			throw err
		} else {
			if(classLesson.instructor_id == req.user.id){
				var instructor = true
				res.render('classes/lessons', {"class": classLesson, "instructor": instructor})
			}
		}
	});
});

router.get('/:id/lessons/:lesson_id', function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, classLesson){
		if (err){
			console.log(err)
			throw err
		} else {
			if(classLesson.instructor_id == req.user.id){
				var instructor = true;
				console.log(classLesson);
				Class.getLessonById([req.params.lesson_id], classLesson, function(err, lesson){
					if (err){
						console.log(err)
						throw err
					} else {
						console.log(lesson)
						res.render('classes/lesson', {"lesson": lesson, "instructor": instructor})
					}
				});
			}
		}
	});
});

module.exports = router;