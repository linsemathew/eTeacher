var mongoose = require('mongoose')

var classSchema = mongoose.Schema({
	title: {
		type: String
	},
	description: {
		type: String
	},
	instructor: {
		type: String
	},
	lessons: [{
			lesson_number: {type: Number},
			lesson_title: {type: String},
			lesson_body: {type: String}
	}]
});

var Class = module.exports = mongoose.model('Class', classSchema);

module.exports.getClasses = function(callback, limit){
	Class.find(callback).sort({_id:-1}).limit(limit);
}

module.exports.getClassesById = function(id, callback){
	Class.findById(id, callback);
}