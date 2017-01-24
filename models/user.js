var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var userSchema = mongoose.model('User', new Schema({ 
	nombre: String,
    apellido: String,
    cedula: String,
	esprofesor: Boolean ,
    type: String,
    password: String,
    user : String
    
}), 'User');

module.exports = mongoose.model('User', userSchema);


