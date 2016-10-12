var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var classSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	instructor: { type: String, required: true },
	lessons: [{
			lesson_number: {type: Number},
			lesson_title: {type: String},
			lesson_body: {type: String}
	}]
});

var Class = mongoose.model('Class', classSchema);

module.exports = Class;

// Get all classes
module.exports.getClasses = function(callback, limit){
	Class.find(callback).sort({_id:-1}).limit(limit);
}

// Get a specific class
module.exports.getClassesById = function(id, callback){
	Class.findById(id, callback);
}