var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var instructorSchema = new Schema({
	first_name: { type: String, required: true },
	last_name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	classes: [{
      class_id: {type: [mongoose.Schema.Types.ObjectId]},
      class_title: {type: String}
    }]
});

var Instructor = mongoose.model('Instructor', instructorSchema);

module.exports = Instructor;