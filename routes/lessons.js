var express = require('express');
var router = express.Router();
Lesson = require('../models/lesson');
Class = require('../models/class');

//Display a single lesson
router.get('/:id', function(req, res, next) {
	Lesson.getLessonById([req.params.id], function(err, lesson){
		if (err){
			console.log(err)
			throw err
		} else {
			console.log(lesson)
			res.render('lessons/details', {"lesson": lesson})
		}
	});
});

//Get form to update a lesson 
router.get('/:id/edit', ensureAuthenticated, function(req, res, next) {
	Lesson.getLessonById([req.params.id], function(err, foundLesson){
		if (err){
			console.log(err)
			throw err
		} else {
			res.render('lessons/editclass', {lesson_title: foundLesson.lesson_title, lesson_title: foundLesson.lesson_title})
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

module.exports = router