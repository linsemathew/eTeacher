var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

var User = mongoose.model('User', userSchema);

module.exports = User;

//Get a User by id
module.exports.getUserById= function(id, callback){
  User.findById(id, callback);
}

//Get a User by email
module.exports.getUserByEmail= function(email, callback){
  var query = {email : email}
  User.findOne(query, callback);
}