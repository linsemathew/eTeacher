var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var instructorSchema = new Schema({
	first_name: { type: String },
	last_name: { type: String },
	email: { type: String },
	classes: [{
      class_id: {type: [mongoose.Schema.Types.ObjectId]},
      class_title: {type: String}
    }]
});

var Instructor = mongoose.model('Instructor', instructorSchema);

module.exports = Instructor;