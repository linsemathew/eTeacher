var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var instructorSchema = new Schema({
	first_name: { type: String },
	last_name: { type: String },
	email: { type: String },
	instructor_classes: [{
		class_id: {type: [mongoose.Schema.Types.ObjectId]},
		class_title: {type: String},
    }],
    classes: [{
		class_id: {type: [mongoose.Schema.Types.ObjectId]},
		class_title: {type: String},
		class_instructor: {type: String}
    }]
});

var Instructor = mongoose.model('Instructor', instructorSchema);
module.exports = Instructor;

//Get a Instructor by email
module.exports.getInstructorByEmail = function(email, callback){
	var query = {email : email}
	Instructor.findOne(query, callback);
}

//Register a Instructor for a class
module.exports.registerForClass = function(classInfo, callback){
	instructor_email = classInfo['instructor_email'];
    class_id = classInfo['class_id'];
    class_title = classInfo['class_title'];
    class_instructor = classInfo['class_instructor'];

    //Only register for a class if they aren't registered already.
	Instructor.findOneAndUpdate({'email': instructor_email, 
		'classes.class_id':{$ne: class_id}},
		{$addToSet: {classes: {class_id: class_id,class_title: class_title, class_instructor: class_instructor}}},
		{safe: true},
		callback
    );
}
