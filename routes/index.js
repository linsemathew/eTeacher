var express = require('express');
var router = express.Router();
Class = require('../models/class')

/* Get home page. */
router.get('/', function(req, res, next) {
	Class.getClasses(function(err, classes){
		if (err){
			res.send(error);
		} else {
			res.render('index', {"classes": classes, title: "Home"})
		}
	}, 3);
});

module.exports = router;