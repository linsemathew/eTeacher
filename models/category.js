var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//Category Schema
var categorySchema = new Schema({
	title: {type: String, required: true},
	created: {type: Date, default: Date.now}
});

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;

// Get all the categories
module.exports.getCategories = function (callback) {
	Category.find(callback);
};