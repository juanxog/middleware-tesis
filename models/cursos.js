var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var userSchema = mongoose.model('Cursos', new Schema({ 
	materia: String,
    asignaciones: [{ type: Schema.Types.ObjectId, ref: 'Actividades' }],
    profesor: {type: String , ref: 'User' },
    matricula : [{ type: Schema.Types.ObjectId, ref: 'User' }]
	
}),'Cursos');

module.exports = mongoose.model('Cursos', userSchema);


