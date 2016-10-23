var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Instructor schema
var instructorSchema = new Schema({
	first_name: { type: String },
	last_name: { type: String },
	email: { type: String },
	//Class that the instructor is teaching
	classes_instructor_for: [{
		class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }
	}],
	//Classes from other instructors
    classes: [{
		class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }
	}],
	created : { type : Date, default : Date.now }
});

var Instructor = mongoose.model('Instructor', instructorSchema);
module.exports = Instructor;

//Get an instructor by email
module.exports.getInstructorByEmail = function(email, callback){

	var query = {email : email}

	Instructor.findOne(query).populate(
		{path: 'classes_instructor_for.class_id',
		model: 'Class', $ne: null}
	).populate(
		{path: 'classes.class_id',
		model: 'Class', $ne: null}
	).exec(callback);
}

//Register an instructor for a class by adding the class to the classes array.
module.exports.registerForClass = function(classInfo, callback){
	var instructor_email = classInfo['instructor_email'];
    var class_id = classInfo['class_id'];

    //Only register for a class if they aren't registered already.
	Instructor.findOneAndUpdate({'email': instructor_email, 
		'classes.class_id':{$ne: class_id}, 'classes_instructor_for':{$ne: class_id}},
		{$addToSet: {classes: {class_id: class_id}}},
		{safe: true},
		callback
    );
}

//Search if instructor is already registered for the class
module.exports.searchForClass = function(classInfo, callback){

	var email = classInfo['instructor_email']
	var class_id = classInfo['class_id']

	Instructor.findOne({'email': email, 'classes': {$elemMatch: {class_id: class_id}}}, callback)
}

//Add a class to the classes the instructor is teaching
module.exports.addClassToTeachingClasses = function(addedClass, instructorEmail, callback){

    //Only register for a class if they aren't registered already.
	Instructor.findOneAndUpdate({'email': instructorEmail,
		'classes.class_id':{$ne: addedClass._id}},
		{ $addToSet: {classes_instructor_for: {class_id: addedClass._id}}},
		{ safe: true },
		callback
    );
}

//Remove class from classes instructor for
module.exports.removeClassInstructorFor = function(instructorEmail, classId, callback){

    //Only register for a class if they aren't registered already.
	Instructor.findOneAndUpdate({'email': instructorEmail},
		{$pull: {classes_instructor_for: {'class_id': classId}}},
		{safe: true},
		callback
    );
}

//Drop registered class
module.exports.dropClass = function(classInfo, callback){

	var instructor_email 	= classInfo['instructor_email'];
	var class_id 			= classInfo['class_id'];

	Instructor.findOneAndUpdate({'email': instructor_email},
		{$pull: {classes: {'class_id': class_id}}},
		{safe: true},
		callback
    );
}


//Remove deleted class
module.exports.removeDeletedClass = function(classId, callback){

	Instructor.update({},
		{$pull: {classes: {'class_id': classId}}},
		{multi: true},
		callback
    );
}
