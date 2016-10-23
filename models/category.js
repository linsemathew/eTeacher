var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//Schema
var categorySchema = new Schema({
	title: { type: String, required: true }
});

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;

// Get all the categories
module.exports.getCategories = function (callback) {
	Category.find(callback);
};