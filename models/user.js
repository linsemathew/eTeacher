var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs')

var userSchema = new Schema({
	first_name: { type: String },
	last_name: { type: String },
	email: { type: String },
	password: { type: String },
	type: { type: String },
	created : { type : Date, default : Date.now }
});

var User = mongoose.model('User', userSchema);
module.exports = User;

//Get a User by id
module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

//Get a User by email
module.exports.getUserByEmail = function(email, callback){
	var query = {email : email}

	User.findOne(query, callback);
}

//Save a student
module.exports.saveStudent = function(newUser, newStudent, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash){
			if (err) {throw err}
			newUser.password = hash;
			//Save both a user and student
			async.parallel([newUser.save, newStudent.save], callback);
		})
	})
}

//Save a instructor
module.exports.saveInstructor = function(newUser, newInstructor, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash){
			if (err) {throw err}
			newUser.password = hash;
			//Save both a user and instructor
			async.parallel([newUser.save, newInstructor.save], callback);
		})
	})
}

//Check if password and password confirmation matches.
module.exports.comparePassword = function(enteredPassword, hash, callback){
	bcrypt.compare(enteredPassword, hash, function(err, isMatch){
		if(err) throw err;
		callback(null, isMatch);
	});
}