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

module.exports = router;