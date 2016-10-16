var express = require('express');
var router = express.Router();
Class = require('../models/class')

router.get('/', function(req, res, next) {
	Class.getClasses(function(err, classes){
		if (err){
			res.send(error);
		} else {
			res.render('classes/index', {"classes": classes})
		}
	});
});

router.get('/:id/details', function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, name){
		if (err){
			res.send(error);
		} else {
			res.render('classes/details', {"class": name})
		}
	});
});

router.get('/:id/lessons/:lesson_id', function(req, res, next) {
	Class.getClassesById([req.params.id], function(err, classLesson){
		if (err){
			res.send(error);
		} else {
			res.render('classes/lessons', {"class": classLesson})
		}
	});
});

module.exports = router;