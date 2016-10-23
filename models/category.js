var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
	title: { type: String, required: true },
});

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;

// Get all categories
module.exports.getCategories = function(callback){
	Category.find(callback);
}