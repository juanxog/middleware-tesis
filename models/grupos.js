var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var userSchema = mongoose.model('Grupos', new Schema({ 

    grupo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    actividad: { type: String, ref: 'Cursos' },
    nota : {type: Number},
    exp : {type: Number},
    id_eval: {type : String}
	
}),'Grupos');

module.exports = mongoose.model('Grupos', userSchema);