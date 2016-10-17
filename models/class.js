var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var classSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	instructor: { type: String, required: true },
	instructor_id: { type: String, required: true },
	lessons: [{
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

// Get a specific class
module.exports.getLessonById = function(id, callback){
	Class.aggregate({ 
		$match : {"shapes.color": "red"}},
		{ $unwind : "$shapes" },
		{ $match : {"shapes.color": "red"}}
	)
}

// Add a new lesson
module.exports.addLesson = function(newLesson, callback){
	class_id = newLesson['class_id'];
    lesson_title = newLesson['lesson_title'];
    lesson_body = newLesson['lesson_body'];

    Class.findByIdAndUpdate(class_id, {
        $push:{"lessons": {
          lesson_title: lesson_title,
          lesson_body: lesson_body
        }}
    }, {
        safe: true,
        upsert:true
    }, callback)
}

// Create a new class
module.exports.createNewClass = function(newClass, callback){
	new Class(newClass).save(callback);
}