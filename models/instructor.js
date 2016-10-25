var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Instructor schema
var instructorSchema = new Schema({
	first_name: {type: String},
	last_name: {type: String},
	email: {type: String},
	//Class that the instructor is teaching
	classes_instructor_for: [{
		class_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Class'}
	}],
	//Registered classes from other instructors
    classes: [{
		class_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Class'}
	}],
	created: {type: Date, default: Date.now}
});

var Instructor = mongoose.model('Instructor', instructorSchema);
module.exports = Instructor;

//Get an instructor by email
module.exports.getInstructorByEmail = function(email, callback){
	var query = {email: email};

	Instructor.findOne(query).populate(
		{path: 'classes_instructor_for.class_id',
		model: 'Class', $ne: null}
	).populate(
		{path: 'classes.class_id',
		model: 'Class', $ne: null}
	).exec(callback);
};

//Register an instructor for a class by adding the class to the classes array.
module.exports.registerForClass = function(classInfo, callback){
	var instructor_email = classInfo['instructor_email'];
    var class_id = classInfo['class_id'];
    var query = {
				    'email': instructor_email, 
				    'classes.class_id': {$ne: class_id}, 
				    'classes_instructor_for': {$ne: class_id}
			    };

    //Only register for a class if they aren't registered already.
	Instructor.findOneAndUpdate(query,
		{$addToSet: {classes: {class_id: class_id}}},
		{safe: true},
		callback
    );
};

//Search if instructor is already registered for a class
module.exports.searchForClass = function(classInfo, callback){
	var email = classInfo['instructor_email'];
	var class_id = classInfo['class_id'];
	var query = {
					'email': email, 
					'classes': {$elemMatch: {class_id: class_id}}
				};

	Instructor.findOne(query, callback);
};

//Add a class to the classes the instructor is teaching
module.exports.addClassToTeachingClasses = function(addedClass, instructorEmail, callback){
	var query = {
					'email': instructorEmail,
					'classes.class_id': {$ne: addedClass._id}
				};

    //Only register for a class if they aren't registered already.
	Instructor.findOneAndUpdate(query,
		{$addToSet: {classes_instructor_for: {class_id: addedClass._id}}},
		{safe: true},
		callback
    );
};

//Remove class from the array, classes instructor for
module.exports.removeClassInstructorFor = function(instructorEmail, classId, callback){
	var query = {'email': instructorEmail}

	Instructor.findOneAndUpdate(query,
		{$pull: {classes_instructor_for: {'class_id': classId}}},
		{safe: true},
		callback
    );
};

//Drop a registered class
module.exports.dropClass = function(classInfo, callback){
	var instructor_email = classInfo['instructor_email'];
	var class_id = classInfo['class_id'];
	var query = {'email': instructor_email};

	Instructor.findOneAndUpdate(query,
		{$pull: {classes: {'class_id': class_id}}},
		{safe: true},
		callback
    );
};


//Remove deleted class from classes instructors are registered for
module.exports.removeDeletedClass = function(classId, callback){
	Instructor.update({},
		{$pull: {classes: {'class_id': classId}}},
		{multi: true},
		callback
    );
};
