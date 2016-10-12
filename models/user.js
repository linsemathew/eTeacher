var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs')

var userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, bcrypt: true },
  type: { type: String }
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
	bcrypt.hash(newUser.password, 10, function(err, hash){
		if err throw err;
		newUser.password = hash;
		//Saves both a user and student
		async.parallel([newUser.save, newStudent.save], callback);
	})
}

//Save a instructor
module.exports.saveInstructor = function(newUser, newInstructor, callback){
	bcrypt.hash(newUser.password, 10, function(err, hash){
		if err throw err;
		newUser.password = hash;
		//Saves both a user and instructor
		async.parallel([newUser.save, newInstructor.save], callback);
	})
}