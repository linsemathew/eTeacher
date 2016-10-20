var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var classSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	instructor: { type: String, required: true },
	instructor_email: { type: String, required: true },
	lessons: [{
		lesson_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}
	}],
	created : { type : Date, default : Date.now }
});

var Class = mongoose.model('Class', classSchema);
module.exports = Class;

// Get all classes
module.exports.getClasses = function(callback, limit){
	Class.find(callback).sort({_id:-1}).limit(limit);
}

// Get a specific class
module.exports.getClassesById = function(id, callback){
	Class.findById(id)
	.populate(
		{path: 'lessons.lesson_id',
		model: 'Lesson'}
	).exec(callback)
}

// Create a new class
module.exports.createNewClass = function(newClass, callback){
	new Class(newClass).save(callback);
}

// Update a class
module.exports.updateClass = function(id, classUpdates, callback){
	var title = classUpdates['title']
	var description = classUpdates['description']

	Class.findOneAndUpdate(
		{ _id: id }, 
		{ title: title, description: description }, 
		{ new: true }, 
		callback
	);
}

//Add lesson to class
module.exports.addLessonToClass = function(class_id, lesson, callback){

    Class.findByIdAndUpdate(class_id, {
        $addToSet: {"lessons": {
          lesson_id: lesson._id,
        }}}, 
        { safe: true, upsert: true }, 
        callback)
}

// Delete a lesson from class
module.exports.deleteLessonFromClass = function(class_id, lesson_id, callback){
	Class.update(
    	{'_id': class_id}, 
    	{ $push: {lessons: {lesson_id: ObjectId(lesson_id)}}},
    	callback
    )
}