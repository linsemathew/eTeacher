var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lessonSchema = new Schema({
	lesson_title: { type: String, required: true },
	lesson_body: { type: String, required: true },
	instructor_email: {type: String, required: true},
	creator_class: {type: mongoose.Schema.Types.ObjectId, ref: 'Class'},
	created : { type : Date, default : Date.now }
});

var Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;

// Get a specific lesson
module.exports.getLessonById = function(id, callback){
	Lesson.findOne({'_id': id}, callback)
}

// Add a new lesson
module.exports.saveLesson = function(newLesson, callback){
	console.log(newLesson)
	new Lesson(newLesson).save(callback);
}

// Update a lesson
module.exports.updateLesson = function(id, lessonUpdates, callback){
	var title = lessonUpdates['title']
	var body = lessonUpdates['body']

	Lesson.findOneAndUpdate(
		{ _id: id }, 
		{ lesson_title: title, lesson_body: body }, 
		{ new: true }, 
		callback
	);
}

//Delete a lesson
module.exports.deleteLesson = function(lesson, callback){

	Lesson.findByIdAndRemove(lesson['lesson_id'], callback)
}

// Delete lesson from a deleted class
module.exports.deleteLessonsFromDeletedClass = function(class_id, callback){
	Lesson.remove({creator_class: class_id}, callback)
}