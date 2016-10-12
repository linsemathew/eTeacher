var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
	first_name: { type: String, required: true },
	last_name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	classes: [{
      class_id: {type: [mongoose.Schema.Types.ObjectId]},
      class_title: {type: String}
    }]
});

var Student = mongoose.model('Student', studentSchema);

module.exports = Student;