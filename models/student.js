var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
	first_name: { type: String },
	last_name: { type: String },
	email: { type: String },
    classes: [{
		class_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Class'}
	}],
    created : { type : Date, default : Date.now }
});

var Student = mongoose.model('Student', studentSchema);
module.exports = Student;

//Get a Student by email
module.exports.getStudentByEmail = function(email, callback){
	var query = {email : email}
	Student.findOne(query).populate(
		{path: 'classes.class_id',
		model: 'Class', $ne: null}
	).exec(callback)
}

//Register a Student for a class
module.exports.registerForClass = function(classInfo, callback){
	student_email = classInfo['student_email'];
    class_id = classInfo['class_id'];
    class_title = classInfo['class_title'];
    class_instructor = classInfo['class_instructor'];

    //Only register for a class if they aren't registered already.
	Student.findOneAndUpdate({'email': student_email, 
		'classes.class_id':{$ne: class_id}},
		{$addToSet: {classes: {class_id: class_id}}},
		{safe: true},
		callback
    );
}

//Drop registered class
module.exports.dropClass = function(classInfo, callback){

	var student_email 		= classInfo['student_email'];
	var class_id 			= classInfo['class_id'];

	Student.findOneAndUpdate({'email': student_email},
		{$pull: {classes: {'class_id': class_id}}},
		{safe: true},
		callback
    );
}

//Remove deleted class
module.exports.removeDeletedClass = function(classId, callback){

	Student.update({},
		{$pull: {classes: {'class_id': classId}}},
		{multi: true},
		callback
    );
}

