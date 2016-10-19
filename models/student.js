var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
	first_name: { type: String },
	last_name: { type: String },
	email: { type: String },
	classes: [{
		class_id: {type: [mongoose.Schema.Types.ObjectId]}
    }],
    created : { type : Date, default : Date.now }
});

var Student = mongoose.model('Student', studentSchema);
module.exports = Student;

//Get a Student by email
module.exports.getStudentByEmail = function(email, callback){
	var query = {email : email}
	Student.findOne(query, callback);
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



