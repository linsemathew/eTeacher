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

module.exports = router;