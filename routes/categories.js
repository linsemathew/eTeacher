var express = require('express');
var router  = express.Router();

Category 	= require('../models/category')

//Get all categories
router.get('/', function(req, res, next) {
	Category.getCategories(function(err, categories){
		if (err){
			console.log(err)
			throw err
		} else {
			console.log('Found all categories.')
			res.render('categories/index', {"categories": categories})
		}
	});
});

//Classes for a specific category
router.get('/:id', function(req, res, next) {
	var category_id = req.params.id

	Class.getClassesByCategory(category_id, function(err, classes){
		if (err){
			console.log(err)
			throw err
		} else {
			console.log('Found class.')
			res.render('categories/classes', {"classes": classes})
		}
	});
});

module.exports = router