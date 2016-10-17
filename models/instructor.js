var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var instructorSchema = new Schema({
	first_name: { type: String },
	last_name: { type: String },
	email: { type: String },
	classes_instructor_for: [{
		class_id: {type: [mongoose.Schema.Types.ObjectId]},
		class_title: {type: String},
		class_description: {type: String},
		lessons: [{
			lesson_title: {type: String},
			lesson_body: {type: String}
		}]
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
		'classes.class_id':{$ne: class_id}, 'classes_instructor_for':{$ne: class_id}},
		{$addToSet: {classes: {class_id: class_id,class_title: class_title, class_instructor: class_instructor}}},
		{safe: true},
		callback
    );
}

//Add a class to the classes the instructor is teaching
module.exports.addClassToTeachingClasses = function(addedClass, instructorEmail, callback){

    //Only register for a class if they aren't registered already.
	Instructor.findOneAndUpdate({'email': instructorEmail,
		'classes.class_id':{$ne: addedClass._id}},
		{$addToSet: {classes_instructor_for: {class_id: addedClass._id, class_title: addedClass.title, class_description: addedClass.description, lessons: addedClass.lessons}}},
		{safe: true},
		callback
    );
}

// module.exports.addNewClass = function(classInfo, callback){

//     //Only register for a class if they aren't registered already.
// 	Instructor.findOneAndUpdate({'email': instructor_email,
// 		{$addToSet: {instructor_classes: {class_id: class_id,class_title: class_title, class_instructor: class_instructor}}},
// 		{safe: true},
// 		callback
//     );
// }
