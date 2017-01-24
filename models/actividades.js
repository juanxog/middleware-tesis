var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var userSchema = mongoose.model('Actividades', new Schema({ 
	nombre : String,
    grupo: [{ type: Schema.Types.ObjectId, ref: 'Grupos' }],
    profesor: { type: String , ref: 'User' },
    nota : Number ,
    curso: { type: String, ref: 'Cursos' }
	
}),'Actividades');

module.exports = mongoose.model('Actividades', userSchema);

