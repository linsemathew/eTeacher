var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Class schema
var classSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	instructor: { type: String, required: true },
	instructor_email: { type: String, required: true },
	//Lessons for the class
	lessons: [
		{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }
	],
	category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
	created : { type : Date, default : Date.now }
});

var Class = mongoose.model( 'Class', classSchema );
module.exports = Class;

// Get the newest 3 classes for the homepage
module.exports.getClasses = function( callback, limit ) {
	Class.find(callback).sort({ _id:-1 }).limit( limit );
}

// Get a specific class
module.exports.getClassesById = function(id, callback){
	Class.findById(id)
	.populate(
		{path: 'lessons',
		model: 'Lesson', $ne: null}
	).exec(callback)
}

// Get classes by a category
module.exports.getClassesByCategory = function(categoryId, callback){
	var query = {'category': categoryId}

	Class.find(query, callback).sort({_id:-1})
}

// Create a new class
module.exports.createNewClass = function(newClassProperties, callback){
	new Class(newClassProperties).save(callback);
}

// Update a class
module.exports.updateClass = function(classID, classUpdates, callback){
	var title 		= classUpdates['title']
	var description = classUpdates['description']
	var query 		= {_id: classID}

	Class.findOneAndUpdate(
		query, 
		{ title: title, description: description }, 
		{ new: true }, 
		callback
	);
}

//Add lesson to class
module.exports.addLessonToClass = function(class_id, lesson, callback){
    Class.findByIdAndUpdate(class_id, {
        $push: {"lessons": 
          lesson,
        }}, 
        { safe: true, upsert: true }, 
        callback)
}

//Delete a class
module.exports.deleteClass = function(class_id, callback){
	Class.findByIdAndRemove(class_id, callback)
}

// Delete a lesson from class
module.exports.deleteLessonFromClass = function(lesson, callback){
	var class_id 		= lesson['class_id'];
	var lesson_id 		= lesson['lesson_id'];
	var query 			= {_id: class_id}

	Class.findOneAndUpdate(
    	query, 
    	{ $pull: {'lessons': lesson_id}},
    	{ safe: true },
    	callback
    )
}